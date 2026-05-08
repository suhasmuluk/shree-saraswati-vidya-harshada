import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { Trophy, Star, Medal, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_ICONS: Record<string, typeof Trophy> = {
  sports: Medal,
  academic: Star,
  arts: Star,
  general: Trophy,
};

const CATEGORY_COLORS: Record<string, string> = {
  sports: 'bg-secondary text-secondary-foreground',
  academic: 'bg-primary text-primary-foreground',
  arts: 'bg-accent text-accent-foreground',
  general: 'bg-muted text-muted-foreground',
};

const BrightStudents = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ student_id: '', category: 'sports', title: '', description: '', achievement_date: format(new Date(), 'yyyy-MM-dd') });

  const { data: achievements = [] } = useQuery({
    queryKey: ['student-achievements'],
    queryFn: async () => {
      const { data } = await supabase
        .from('student_achievements')
        .select('*, students(name, classes(name))')
        .order('achievement_date', { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('id, name').order('name');
      return data ?? [];
    },
  });

  // Auto: Best attendance students (top 3)
  const { data: topAttendance = [] } = useQuery({
    queryKey: ['top-attendance'],
    queryFn: async () => {
      const { data } = await supabase.from('attendance').select('student_id, status, students(name, classes(name))');
      if (!data) return [];
      const counts: Record<string, { name: string; className: string; present: number; total: number }> = {};
      data.forEach((a: any) => {
        if (!counts[a.student_id]) counts[a.student_id] = { name: a.students?.name ?? '', className: a.students?.classes?.name ?? '', present: 0, total: 0 };
        counts[a.student_id].total++;
        if (a.status === 'present') counts[a.student_id].present++;
      });
      return Object.entries(counts)
        .filter(([, v]) => v.total >= 5)
        .map(([id, v]) => ({ id, ...v, percentage: Math.round((v.present / v.total) * 100) }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('student_achievements').insert({
        student_id: form.student_id,
        category: form.category,
        title: form.title,
        description: form.description || null,
        achievement_date: form.achievement_date,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-achievements'] });
      toast({ title: t('achievements.added') });
      setOpen(false);
      setForm({ student_id: '', category: 'sports', title: '', description: '', achievement_date: format(new Date(), 'yyyy-MM-dd') });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('student_achievements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['student-achievements'] }),
  });

  return (
    <div className="space-y-4">
      {/* Auto: Best Attendance */}
      {topAttendance.length > 0 && (
        <Card className="shadow-sm border-secondary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-warning" />
              {t('achievements.bestAttendance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topAttendance.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-primary-foreground ${i === 0 ? 'bg-warning' : i === 1 ? 'bg-secondary' : 'bg-accent'}`}>
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.className} • {s.percentage}% {t('achievements.attendance')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Achievements */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              {t('achievements.title')}
            </CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />{t('achievements.add')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('achievements.addTitle')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(); }} className="space-y-4">
                  <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                    <SelectTrigger><SelectValue placeholder={t('achievements.selectStudent')} /></SelectTrigger>
                    <SelectContent>
                      {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sports">{t('achievements.sports')}</SelectItem>
                      <SelectItem value="academic">{t('achievements.academic')}</SelectItem>
                      <SelectItem value="arts">{t('achievements.arts')}</SelectItem>
                      <SelectItem value="general">{t('achievements.general')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder={t('achievements.titleField')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  <Textarea placeholder={t('achievements.description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  <Input type="date" value={form.achievement_date} onChange={(e) => setForm({ ...form, achievement_date: e.target.value })} required />
                  <Button type="submit" className="w-full" disabled={addMutation.isPending || !form.student_id}>
                    {addMutation.isPending ? t('common.saving') : t('achievements.add')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">{t('achievements.noAchievements')}</p>
          ) : (
            <div className="space-y-3">
              {achievements.map((a: any) => {
                const Icon = CATEGORY_ICONS[a.category] || Trophy;
                return (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 group">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${CATEGORY_COLORS[a.category] || CATEGORY_COLORS.general}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{(a.students as any)?.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">{t(`achievements.${a.category}`)}</Badge>
                        <span className="text-xs text-muted-foreground">{(a.students as any)?.classes?.name}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-0.5">{a.title}</p>
                      {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(a.achievement_date), 'dd MMM yyyy')}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 flex-shrink-0" onClick={() => deleteMutation.mutate(a.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BrightStudents;
