import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { Plus, Search, Edit, Trash2, Bus, Users, Package, Eye } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import SiblingManager from '@/components/students/SiblingManager';
import { WhatsAppTransportButton } from '@/components/students/WhatsAppActions';
import IssuedItemsDetails from '@/components/students/IssuedItemsDetails';
import { ArchiveRestore, Archive } from 'lucide-react';
import { archiveEntity, restoreEntity, softDeleteEntity } from '@/lib/softDelete';

interface StudentForm {
  name: string;
  date_of_birth: string;
  gender: string;
  class_id: string;
  parent_name: string;
  parent_phone: string;
  address: string;
  admission_date: string;
  has_transport: boolean;
  transport_type: string;
  transport_route: string;
  books_issued: boolean;
  uniform_issued: boolean;
  materials_issued: boolean;
  items_issue_date: string;
  items_remarks: string;
}

const emptyForm: StudentForm = {
  name: '', date_of_birth: '', gender: '', class_id: '',
  parent_name: '', parent_phone: '', address: '', admission_date: format(new Date(), 'yyyy-MM-dd'),
  has_transport: false, transport_type: '', transport_route: '',
  books_issued: false, uniform_issued: false, materials_issued: false,
  items_issue_date: '', items_remarks: '',
};

function getIssuedStatus(s: any): 'all' | 'partial' | 'none' {
  const items = [s.books_issued, s.uniform_issued, s.materials_issued];
  const count = items.filter(Boolean).length;
  if (count === 3) return 'all';
  if (count > 0) return 'partial';
  return 'none';
}

function IssuedStatusBadge({ status }: { status: 'all' | 'partial' | 'none' }) {
  if (status === 'all') return <Badge variant="default" className="text-[10px] bg-green-600 hover:bg-green-700">✅ All Issued</Badge>;
  if (status === 'partial') return <Badge variant="secondary" className="text-[10px] bg-yellow-500 text-black hover:bg-yellow-600">⚠️ Partial</Badge>;
  return <Badge variant="destructive" className="text-[10px]">❌ Not Issued</Badge>;
}

const Students = () => {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [issuedFilter, setIssuedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [detailsStudent, setDetailsStudent] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('*').order('name');
      return data ?? [];
    },
  });

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('*, classes(name)').order('name');
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: StudentForm) => {
      const payload = {
        ...data,
        class_id: data.class_id || null,
        date_of_birth: data.date_of_birth || null,
        transport_type: data.has_transport ? data.transport_type : null,
        transport_route: data.has_transport ? data.transport_route : null,
        items_issue_date: data.items_issue_date || null,
        items_remarks: data.items_remarks || null,
      };
      if (editId) {
        const { error } = await supabase.from('students').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('students').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: editId ? 'Student updated' : 'Student added' });
      closeDialog();
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Student deleted' });
    },
  });

  const closeDialog = () => {
    setOpen(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const openEdit = (student: any) => {
    setEditId(student.id);
    setForm({
      name: student.name, date_of_birth: student.date_of_birth ?? '',
      gender: student.gender ?? '', class_id: student.class_id ?? '',
      parent_name: student.parent_name, parent_phone: student.parent_phone,
      address: student.address ?? '', admission_date: student.admission_date,
      has_transport: student.has_transport ?? false,
      transport_type: student.transport_type ?? '',
      transport_route: student.transport_route ?? '',
      books_issued: student.books_issued ?? false,
      uniform_issued: student.uniform_issued ?? false,
      materials_issued: student.materials_issued ?? false,
      items_issue_date: student.items_issue_date ?? '',
      items_remarks: student.items_remarks ?? '',
    });
    setOpen(true);
  };

  const filtered = students.filter((s: any) => {
    const matchesSearch = (s.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (s.parent_name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter === 'all' || s.class_id === classFilter;
    const status = getIssuedStatus(s);
    const matchesIssued = issuedFilter === 'all' ||
      (issuedFilter === 'issued' && status === 'all') ||
      (issuedFilter === 'partial' && status === 'partial') ||
      (issuedFilter === 'not_issued' && status === 'none');
    return matchesSearch && matchesClass && matchesIssued;
  });

  const hasMissingItems = (s: any) => !s.books_issued || !s.uniform_issued || !s.materials_issued;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('students.title')}</h1>
          <p className="text-muted-foreground">{students.length} {t('students.totalStudents')}</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />{t('students.addStudent')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? t('students.editStudent') : t('students.addNew')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <Input placeholder={t('students.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">{t('students.dob')}</label>
                  <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
                </div>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue placeholder={t('students.gender')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">{t('students.male')}</SelectItem>
                    <SelectItem value="Female">{t('students.female')}</SelectItem>
                    <SelectItem value="Other">{t('students.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={form.class_id} onValueChange={(v) => setForm({ ...form, class_id: v })}>
                <SelectTrigger><SelectValue placeholder={t('students.selectClass')} /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Input placeholder={t('students.parentName')} value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} required />
              <Input placeholder={t('students.phone')} value={form.parent_phone} onChange={(e) => setForm({ ...form, parent_phone: e.target.value })} required />
              <Input placeholder={t('students.address')} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <div>
                <label className="text-sm text-muted-foreground">{t('students.admissionDate')}</label>
                <Input type="date" value={form.admission_date} onChange={(e) => setForm({ ...form, admission_date: e.target.value })} required />
              </div>

              {/* Transport Section */}
              <div className="border rounded-md p-3 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Bus className="h-4 w-4" /> {t('students.hasTransport')}
                  </label>
                  <Switch checked={form.has_transport} onCheckedChange={(v) => setForm({ ...form, has_transport: v })} />
                </div>
                {form.has_transport && (
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={form.transport_type} onValueChange={(v) => setForm({ ...form, transport_type: v })}>
                      <SelectTrigger><SelectValue placeholder={t('students.transportType')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bus">{t('students.bus')}</SelectItem>
                        <SelectItem value="Car">{t('students.car')}</SelectItem>
                        <SelectItem value="Van">{t('students.van')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder={t('students.transportRoute')} value={form.transport_route} onChange={(e) => setForm({ ...form, transport_route: e.target.value })} />
                  </div>
                )}
              </div>

              {/* Issued Items Section */}
              <div className="border rounded-md p-3 space-y-3 bg-muted/30">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" /> 📦 Issued Items
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="books" checked={form.books_issued} onCheckedChange={(v) => setForm({ ...form, books_issued: !!v })} />
                    <label htmlFor="books" className="text-sm cursor-pointer">Books Issued</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="uniform" checked={form.uniform_issued} onCheckedChange={(v) => setForm({ ...form, uniform_issued: !!v })} />
                    <label htmlFor="uniform" className="text-sm cursor-pointer">Uniform Issued</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="materials" checked={form.materials_issued} onCheckedChange={(v) => setForm({ ...form, materials_issued: !!v })} />
                    <label htmlFor="materials" className="text-sm cursor-pointer">Study Materials Issued</label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Issue Date</label>
                    <Input type="date" value={form.items_issue_date} onChange={(e) => setForm({ ...form, items_issue_date: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Remarks</label>
                    <Input placeholder="e.g. Partial uniform" value={form.items_remarks} onChange={(e) => setForm({ ...form, items_remarks: e.target.value })} />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? t('common.saving') : editId ? t('students.updateStudent') : t('students.addStudent')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('students.search')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('students.allClasses')}</SelectItem>
            {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={issuedFilter} onValueChange={setIssuedFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items Status</SelectItem>
            <SelectItem value="issued">✅ All Issued</SelectItem>
            <SelectItem value="partial">⚠️ Partial</SelectItem>
            <SelectItem value="not_issued">❌ Not Issued</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Student List */}
      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">{t('students.noStudents')}</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((s: any) => {
            const status = getIssuedStatus(s);
            const missing = hasMissingItems(s);
            return (
              <Card
                key={s.id}
                className={`shadow-sm cursor-pointer transition-colors ${selectedStudent?.id === s.id ? 'ring-2 ring-primary' : ''} ${missing ? 'border-l-4 border-l-destructive' : ''}`}
                onClick={() => setSelectedStudent(selectedStudent?.id === s.id ? null : s)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground truncate">{s.name}</h3>
                        {s.has_transport && (
                          <Badge variant="secondary" className="text-[10px] flex items-center gap-1 flex-shrink-0">
                            <Bus className="h-3 w-3" /> {s.transport_type} {s.transport_route ? `• ${s.transport_route}` : ''}
                          </Badge>
                        )}
                        <IssuedStatusBadge status={status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(s.classes as any)?.name ?? t('students.noClass')} • {t('students.parent')}: {s.parent_name} • {s.parent_phone}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="icon" onClick={() => setDetailsStudent(s)} title="View issued items">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {s.has_transport && s.transport_route && (
                        <WhatsAppTransportButton
                          studentName={s.name}
                          transportType={s.transport_type}
                          transportRoute={s.transport_route}
                          parentPhone={s.parent_phone}
                        />
                      )}
                      <Button variant="outline" size="icon" onClick={() => openEdit(s)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setDeleteTarget(s)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {selectedStudent?.id === s.id && (
                    <div className="mt-4 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
                      <SiblingManager studentId={s.id} studentName={s.name} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) { setDeleteTarget(null); setDeleteReason(''); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete <span className="font-semibold">{deleteTarget?.name}</span>. This action cannot be undone. All related records (fees, attendance, etc.) may also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Reason for deletion *</label>
            <Textarea
              placeholder="e.g. Student left the school, duplicate entry..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={!deleteReason.trim() || deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget && deleteReason.trim()) {
                  deleteMutation.mutate(deleteTarget.id, {
                    onSuccess: () => {
                      setDeleteTarget(null);
                      setDeleteReason('');
                    },
                  });
                }
              }}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Student'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Issued Items Details Dialog */}
      <IssuedItemsDetails student={detailsStudent} onClose={() => setDetailsStudent(null)} />
    </div>
  );
};

export default Students;
