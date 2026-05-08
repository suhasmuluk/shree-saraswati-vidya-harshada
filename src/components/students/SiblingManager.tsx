import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { Plus, Trash2, Link2, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SiblingManagerProps {
  studentId: string;
  studentName: string;
}

interface SiblingForm {
  sibling_name: string;
  sibling_class: string;
  sibling_section: string;
  relationship: string;
  linked_student_id: string;
}

const emptySiblingForm: SiblingForm = {
  sibling_name: '', sibling_class: '', sibling_section: '', relationship: 'Brother', linked_student_id: '',
};

const SiblingManager = ({ studentId, studentName }: SiblingManagerProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SiblingForm>(emptySiblingForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: siblings = [] } = useQuery({
    queryKey: ['siblings', studentId],
    queryFn: async () => {
      const { data } = await supabase
        .from('siblings')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at');
      return data ?? [];
    },
  });

  const { data: allStudents = [] } = useQuery({
    queryKey: ['students-for-linking'],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('id, name, classes(name)').order('name');
      return data ?? [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: SiblingForm) => {
      const payload: any = {
        student_id: studentId,
        sibling_name: data.sibling_name,
        sibling_class: data.sibling_class || null,
        sibling_section: data.sibling_section || null,
        relationship: data.relationship,
        linked_student_id: data.linked_student_id || null,
      };
      const { error } = await supabase.from('siblings').insert(payload);
      if (error) throw error;

      // If linked, also create reverse sibling record
      if (data.linked_student_id) {
        const reverseRelationship = data.relationship === 'Brother' ? 'Sister' : 'Brother';
        await supabase.from('siblings').insert({
          student_id: data.linked_student_id,
          sibling_name: studentName,
          relationship: reverseRelationship,
          linked_student_id: studentId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siblings'] });
      toast({ title: t('siblings.added') });
      setOpen(false);
      setForm(emptySiblingForm);
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('siblings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siblings'] });
      toast({ title: t('siblings.deleted') });
    },
  });

  const otherStudents = allStudents.filter((s: any) => s.id !== studentId);

  const handleLinkedStudentChange = (linkedId: string) => {
    if (linkedId === '_none') {
      setForm({ ...form, linked_student_id: '' });
      return;
    }
    const linked = allStudents.find((s: any) => s.id === linkedId);
    setForm({
      ...form,
      linked_student_id: linkedId,
      sibling_name: linked?.name || form.sibling_name,
      sibling_class: (linked as any)?.classes?.name || form.sibling_class,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users className="h-4 w-4" /> {t('siblings.title')} ({siblings.length})
        </h4>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><Plus className="h-3 w-3 mr-1" /> {t('siblings.add')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('siblings.addTitle')}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form); }} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">{t('siblings.linkExisting')}</label>
                <Select value={form.linked_student_id || '_none'} onValueChange={handleLinkedStudentChange}>
                  <SelectTrigger><SelectValue placeholder={t('siblings.selectStudent')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">{t('siblings.notInSchool')}</SelectItem>
                    {otherStudents.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({(s.classes as any)?.name || 'No class'})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder={t('siblings.name')}
                value={form.sibling_name}
                onChange={(e) => setForm({ ...form, sibling_name: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder={t('siblings.class')}
                  value={form.sibling_class}
                  onChange={(e) => setForm({ ...form, sibling_class: e.target.value })}
                />
                <Input
                  placeholder={t('siblings.section')}
                  value={form.sibling_section}
                  onChange={(e) => setForm({ ...form, sibling_section: e.target.value })}
                />
              </div>
              <Select value={form.relationship} onValueChange={(v) => setForm({ ...form, relationship: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brother">{t('siblings.brother')}</SelectItem>
                  <SelectItem value="Sister">{t('siblings.sister')}</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                {addMutation.isPending ? t('common.saving') : t('siblings.add')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {siblings.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('siblings.none')}</p>
      ) : (
        <div className="space-y-2">
          {siblings.map((sib: any) => (
            <Card key={sib.id} className="shadow-none border">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">{sib.sibling_name}</span>
                    <Badge variant="outline" className="text-[10px]">{sib.relationship}</Badge>
                    {sib.linked_student_id && (
                      <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                        <Link2 className="h-2.5 w-2.5" /> {t('siblings.linked')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sib.sibling_class && `${t('siblings.class')}: ${sib.sibling_class}`}
                    {sib.sibling_section && ` • ${t('siblings.section')}: ${sib.sibling_section}`}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(sib.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SiblingManager;
