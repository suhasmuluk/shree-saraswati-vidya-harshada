import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { Plus, Search, Edit, UserPlus, Phone, Mail, School, Calendar, Filter, TrendingUp, Users, PhoneCall, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';

const STATUSES = ['New', 'Follow-up', 'Interested', 'Not Interested', 'Converted'];
const SOURCES = ['Walk-in', 'Website', 'Call', 'Referral'];

interface InquiryForm {
  student_name: string;
  parent_name: string;
  contact_number: string;
  alternate_contact: string;
  email: string;
  class_interested: string;
  previous_school: string;
  inquiry_date: string;
  source: string;
  address: string;
  remarks: string;
  status: string;
}

const emptyForm: InquiryForm = {
  student_name: '', parent_name: '', contact_number: '', alternate_contact: '',
  email: '', class_interested: '', previous_school: '',
  inquiry_date: format(new Date(), 'yyyy-MM-dd'), source: 'Walk-in',
  address: '', remarks: '', status: 'New',
};

function statusColor(status: string) {
  switch (status) {
    case 'New': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Follow-up': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Interested': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'Not Interested': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
    case 'Converted': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default: return '';
  }
}

const Inquiries = () => {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<InquiryForm>(emptyForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('*').order('name');
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InquiryForm) => {
      if (editId) {
        const { error } = await supabase.from('inquiries').update(data).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('inquiries').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast({ title: editId ? t('inquiry.updated') : t('inquiry.added') });
      setOpen(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const convertMutation = useMutation({
    mutationFn: async (inquiry: any) => {
      // Create student from inquiry
      const { data: student, error: studentErr } = await supabase.from('students').insert({
        name: inquiry.student_name,
        parent_name: inquiry.parent_name,
        parent_phone: inquiry.contact_number,
        address: inquiry.address || '',
        class_id: classes.find(c => c.name === inquiry.class_interested)?.id || null,
        inquiry_id: inquiry.id,
      }).select().single();
      if (studentErr) throw studentErr;

      // Update inquiry status
      const { error: updateErr } = await supabase.from('inquiries').update({
        status: 'Converted',
        converted_student_id: student.id,
      }).eq('id', inquiry.id);
      if (updateErr) throw updateErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: t('inquiry.converted') });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const openEdit = (inq: any) => {
    setEditId(inq.id);
    setForm({
      student_name: inq.student_name, parent_name: inq.parent_name,
      contact_number: inq.contact_number, alternate_contact: inq.alternate_contact || '',
      email: inq.email || '', class_interested: inq.class_interested || '',
      previous_school: inq.previous_school || '',
      inquiry_date: inq.inquiry_date, source: inq.source,
      address: inq.address || '', remarks: inq.remarks || '', status: inq.status,
    });
    setOpen(true);
  };

  const filtered = inquiries.filter((inq: any) => {
    const matchSearch = !search || inq.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      inq.parent_name?.toLowerCase().includes(search.toLowerCase()) ||
      inq.contact_number?.includes(search);
    const matchStatus = statusFilter === 'all' || inq.status === statusFilter;
    const matchSource = sourceFilter === 'all' || inq.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  // Stats
  const total = inquiries.length;
  const newCount = inquiries.filter((i: any) => i.status === 'New').length;
  const followUp = inquiries.filter((i: any) => i.status === 'Follow-up').length;
  const converted = inquiries.filter((i: any) => i.status === 'Converted').length;
  const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0';

  const stats = [
    { label: t('inquiry.totalInquiries'), value: total, icon: Users, color: 'bg-primary' },
    { label: t('inquiry.newInquiries'), value: newCount, icon: Plus, color: 'bg-blue-600' },
    { label: t('inquiry.followUpPending'), value: followUp, icon: PhoneCall, color: 'bg-yellow-500' },
    { label: t('inquiry.convertedAdmissions'), value: converted, icon: CheckCircle, color: 'bg-green-600' },
    { label: t('inquiry.conversionRate'), value: `${conversionRate}%`, icon: TrendingUp, color: 'bg-purple-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('inquiry.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('inquiry.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> {t('inquiry.addInquiry')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? t('inquiry.editInquiry') : t('inquiry.addInquiry')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t('inquiry.studentName')} *</label>
                  <Input value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('inquiry.parentName')} *</label>
                  <Input value={form.parent_name} onChange={e => setForm({ ...form, parent_name: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('inquiry.contact')} *</label>
                  <Input value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('inquiry.alternateContact')}</label>
                  <Input value={form.alternate_contact} onChange={e => setForm({ ...form, alternate_contact: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('inquiry.email')}</label>
                  <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('inquiry.classInterested')}</label>
                  <Select value={form.class_interested} onValueChange={v => setForm({ ...form, class_interested: v })}>
                    <SelectTrigger><SelectValue placeholder={t('students.selectClass')} /></SelectTrigger>
                    <SelectContent>
                      {classes.map((c: any) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('inquiry.previousSchool')}</label>
                  <Input value={form.previous_school} onChange={e => setForm({ ...form, previous_school: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('inquiry.inquiryDate')}</label>
                  <Input type="date" value={form.inquiry_date} onChange={e => setForm({ ...form, inquiry_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('inquiry.source')}</label>
                  <Select value={form.source} onValueChange={v => setForm({ ...form, source: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {editId && (
                  <div>
                    <label className="text-sm font-medium">{t('inquiry.status')}</label>
                    <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">{t('inquiry.address')}</label>
                <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">{t('inquiry.remarks')}</label>
                <Textarea value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditId(null); setForm(emptyForm); }}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map(stat => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('inquiry.search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><Filter className="h-4 w-4 mr-1" /><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">{t('common.loading')}</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{t('inquiry.noInquiries')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('inquiry.studentName')}</TableHead>
                    <TableHead>{t('inquiry.parentName')}</TableHead>
                    <TableHead>{t('inquiry.contact')}</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>{t('inquiry.source')}</TableHead>
                    <TableHead>{t('inquiry.status')}</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((inq: any) => (
                    <TableRow key={inq.id} className={inq.status === 'Follow-up' ? 'bg-yellow-50 dark:bg-yellow-950/20' : inq.status === 'Converted' ? 'bg-green-50 dark:bg-green-950/20' : ''}>
                      <TableCell className="font-medium">{inq.student_name}</TableCell>
                      <TableCell>{inq.parent_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {inq.contact_number}
                        </div>
                      </TableCell>
                      <TableCell>{inq.class_interested || '-'}</TableCell>
                      <TableCell>{inq.inquiry_date}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{inq.source}</Badge></TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(inq.status)}`}>
                          {inq.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(inq)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {inq.status !== 'Converted' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                              onClick={() => convertMutation.mutate(inq)}
                              disabled={convertMutation.isPending}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Admit
                            </Button>
                          )}
                          {inq.status === 'Converted' && (
                            <Badge variant="default" className="bg-green-600 text-xs">✅ Admitted</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Inquiries;
