import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useUserRole } from '@/hooks/useUserRole';
import { Plus, Edit, Trash2, Phone, MapPin, UserCog, Car, School, Users, Archive, ArchiveRestore } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { archiveEntity, restoreEntity, softDeleteEntity, type EntityType } from '@/lib/softDelete';

const Teachers = () => {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', class_id: '' });
  const [staffOpen, setStaffOpen] = useState(false);
  const [staffEditId, setStaffEditId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState({ name: '', role: '', phone: '', address: '' });
  const [classOpen, setClassOpen] = useState(false);
  const [classEditId, setClassEditId] = useState<string | null>(null);
  const [classForm, setClassForm] = useState({ name: '' });
  const [deleteTarget, setDeleteTarget] = useState<{ type: EntityType; id: string; name: string } | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { isAdmin } = useUserRole();

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('*').order('name');
      return data ?? [];
    },
  });

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data } = await supabase.from('teachers').select('*, classes(name)').eq('is_deleted', false).order('name');
      return data ?? [];
    },
  });

  const { data: staff = [], isLoading: staffLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await supabase.from('staff').select('*').eq('is_deleted', false).order('role').order('name');
      return data ?? [];
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-count'],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('id, class_id').eq('is_deleted', false);
      return data ?? [];
    },
  });

  // Teacher mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name: form.name, phone: form.phone, class_id: form.class_id || null };
      if (editId) {
        const { error } = await supabase.from('teachers').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('teachers').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({ title: editId ? 'Teacher updated' : 'Teacher added' });
      closeDialog();
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const archiveMutation = useMutation({
    mutationFn: async ({ type, id, name, reason }: { type: EntityType; id: string; name: string; reason: string }) => {
      return await softDeleteEntity(type, id, name, reason);
    },
    onSuccess: (res, vars) => {
      queryClient.invalidateQueries({ queryKey: [vars.type === 'teacher' ? 'teachers' : 'staff'] });
      toast({
        title: res.archivedInstead ? `${vars.type === 'teacher' ? 'Teacher' : 'Staff'} archived` : `${vars.type === 'teacher' ? 'Teacher' : 'Staff'} deleted`,
        description: res.archivedInstead
          ? 'Linked records exist (attendance/salary). Record was archived to preserve history.'
          : 'Record removed from active lists.',
      });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const restoreMutation = useMutation({
    mutationFn: async ({ type, id, name }: { type: EntityType; id: string; name: string }) => {
      await restoreEntity(type, id, name);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [vars.type === 'teacher' ? 'teachers' : 'staff'] });
      toast({ title: 'Restored' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  // Staff mutations
  const staffSaveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name: staffForm.name, role: staffForm.role, phone: staffForm.phone, address: staffForm.address || null };
      if (staffEditId) {
        const { error } = await supabase.from('staff').update(payload).eq('id', staffEditId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('staff').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({ title: staffEditId ? 'Staff updated' : 'Staff added' });
      closeStaffDialog();
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });


  // Class mutations
  const classSaveMutation = useMutation({
    mutationFn: async () => {
      if (classEditId) {
        const { error } = await supabase.from('classes').update({ name: classForm.name }).eq('id', classEditId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('classes').insert({ name: classForm.name });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({ title: classEditId ? 'Class updated' : 'Class added' });
      closeClassDialog();
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const classDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({ title: 'Class deleted' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const closeDialog = () => { setOpen(false); setEditId(null); setForm({ name: '', phone: '', class_id: '' }); };
  const closeStaffDialog = () => { setStaffOpen(false); setStaffEditId(null); setStaffForm({ name: '', role: '', phone: '', address: '' }); };
  const closeClassDialog = () => { setClassOpen(false); setClassEditId(null); setClassForm({ name: '' }); };

  const openEdit = (t: any) => {
    setEditId(t.id);
    setForm({ name: t.name, phone: t.phone, class_id: t.class_id ?? '' });
    setOpen(true);
  };

  const openStaffEdit = (s: any) => {
    setStaffEditId(s.id);
    setStaffForm({ name: s.name, role: s.role, phone: s.phone, address: s.address ?? '' });
    setStaffOpen(true);
  };

  const openClassEdit = (c: any) => {
    setClassEditId(c.id);
    setClassForm({ name: c.name });
    setClassOpen(true);
  };

  const getStudentCount = (classId: string) => students.filter((s: any) => s.class_id === classId).length;
  const getTeacherForClass = (classId: string) => {
    const tc = teachers.find((tc: any) => tc.class_id === classId);
    return tc ? (tc as any).name : null;
  };

  const roleColor = (role: string) => {
    if (role.toLowerCase().includes('driver')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (role.toLowerCase().includes('peon')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    if (role.toLowerCase().includes('ayah')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    if (role.toLowerCase().includes('guard')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('teachers.title')}</h1>
        <p className="text-muted-foreground">{classes.length} Classes • {teachers.length} {t('teachers.subtitle')} • {staff.length} {t('teachers.staffMembers')}</p>
      </div>

      <Tabs defaultValue="classes">
        <TabsList>
          <TabsTrigger value="classes" className="gap-1.5"><School className="h-4 w-4" />{t('nav.classes')}</TabsTrigger>
          <TabsTrigger value="teachers" className="gap-1.5"><UserCog className="h-4 w-4" />{t('nav.teachers')}</TabsTrigger>
          <TabsTrigger value="staff" className="gap-1.5"><Car className="h-4 w-4" />{t('teachers.staff')}</TabsTrigger>
        </TabsList>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-4 mt-4">
          {isAdmin && (
            <div className="flex justify-end">
              <Dialog open={classOpen} onOpenChange={(v) => { if (!v) closeClassDialog(); else setClassOpen(true); }}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" />Add Class</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{classEditId ? 'Edit Class' : 'Add Class'}</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => { e.preventDefault(); classSaveMutation.mutate(); }} className="space-y-4">
                    <Input placeholder="Class name" value={classForm.name} onChange={(e) => setClassForm({ name: e.target.value })} required />
                    <Button type="submit" className="w-full" disabled={classSaveMutation.isPending}>
                      {classSaveMutation.isPending ? t('common.saving') : classEditId ? t('common.update') : 'Add Class'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((c: any) => (
              <Card key={c.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{c.name}</h3>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openClassEdit(c)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => classDeleteMutation.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{getStudentCount(c.id)} Students</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserCog className="h-4 w-4" />
                      <span>{getTeacherForClass(c.id) ?? 'Not Assigned'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Teachers Tab */}
        <TabsContent value="teachers" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />{t('teachers.addTeacher')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editId ? t('teachers.editTeacher') : t('teachers.addTeacher')}</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
                  <Input placeholder={t('teachers.teacherName')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <Input placeholder={t('teachers.phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                  <Select value={form.class_id} onValueChange={(v) => setForm({ ...form, class_id: v })}>
                    <SelectTrigger><SelectValue placeholder={t('teachers.assignClass')} /></SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? t('common.saving') : editId ? t('common.update') : t('teachers.addTeacher')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? <p className="text-muted-foreground">{t('common.loading')}</p> : teachers.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">{t('teachers.noTeachers')}</CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {teachers.map((tc: any) => {
                const isArchived = tc.is_active === false || tc.status === 'archived';
                return (
                <Card key={tc.id} className={`shadow-sm ${isArchived ? 'opacity-70 border-l-4 border-l-muted-foreground' : ''}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{tc.name}</h3>
                        {isArchived && (
                          <Badge variant="outline" className="text-[10px] border-muted-foreground text-muted-foreground">
                            <Archive className="h-3 w-3 mr-1" /> Archived
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{tc.phone}</span>
                        <Badge variant="secondary">{(tc.classes as any)?.name ?? t('teachers.notAssigned')}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!isArchived && <Button variant="outline" size="icon" onClick={() => openEdit(tc)}><Edit className="h-4 w-4" /></Button>}
                      {isArchived ? (
                        <Button variant="outline" size="icon" onClick={() => restoreMutation.mutate({ type: 'teacher', id: tc.id, name: tc.name })} title="Restore">
                          <ArchiveRestore className="h-4 w-4 text-primary" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="icon" onClick={() => setDeleteTarget({ type: 'teacher', id: tc.id, name: tc.name })} title="Archive / Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );})}
            </div>
          )}
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={staffOpen} onOpenChange={(v) => { if (!v) closeStaffDialog(); else setStaffOpen(true); }}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />{t('teachers.addStaff')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{staffEditId ? t('teachers.editStaff') : t('teachers.addStaff')}</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); staffSaveMutation.mutate(); }} className="space-y-4">
                  <Input placeholder={t('teachers.staffName')} value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} required />
                  <Select value={staffForm.role} onValueChange={(v) => setStaffForm({ ...staffForm, role: v })}>
                    <SelectTrigger><SelectValue placeholder={t('teachers.role')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Car Driver">Car Driver</SelectItem>
                      <SelectItem value="Van Driver">Van Driver</SelectItem>
                      <SelectItem value="Bus Driver">Bus Driver</SelectItem>
                      <SelectItem value="Peon">Peon</SelectItem>
                      <SelectItem value="Ayah">Ayah</SelectItem>
                      <SelectItem value="Security Guard">Security Guard</SelectItem>
                      <SelectItem value="Cleaner">Cleaner</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder={t('teachers.phone')} value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} required />
                  <Input placeholder={t('students.address')} value={staffForm.address} onChange={(e) => setStaffForm({ ...staffForm, address: e.target.value })} />
                  <Button type="submit" className="w-full" disabled={staffSaveMutation.isPending}>
                    {staffSaveMutation.isPending ? t('common.saving') : staffEditId ? t('common.update') : t('teachers.addStaff')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {staffLoading ? <p className="text-muted-foreground">{t('common.loading')}</p> : staff.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">{t('teachers.noStaff')}</CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {staff.map((s: any) => (
                <Card key={s.id} className="shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{s.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor(s.role)}`}>{s.role}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>
                        {s.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.address}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => openStaffEdit(s)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" onClick={() => staffDeleteMutation.mutate(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Teachers;
