import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { format } from 'date-fns';

const Homework = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', class_id: '', due_date: '' });
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('*').order('name');
      return data ?? [];
    },
  });

  const [homework, setHomework] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('homework') || '[]'); } catch { return []; }
  });

  const saveHomework = () => {
    if (!form.title || !form.class_id) return;
    const className = classes.find((c: any) => c.id === form.class_id);
    const newItem = {
      id: Date.now().toString(),
      ...form,
      class_name: (className as any)?.name || '',
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...homework];
    setHomework(updated);
    localStorage.setItem('homework', JSON.stringify(updated));
    setOpen(false);
    setForm({ title: '', description: '', class_id: '', due_date: '' });
    toast({ title: 'Homework added' });
  };

  const deleteHomework = (id: string) => {
    const updated = homework.filter((h) => h.id !== id);
    setHomework(updated);
    localStorage.setItem('homework', JSON.stringify(updated));
    toast({ title: 'Homework deleted' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('homework.title')}</h1>
          <p className="text-muted-foreground">{t('homework.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />{t('homework.addHomework')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('homework.addTitle')}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder={t('homework.titleField')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder={t('homework.description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              <Select value={form.class_id} onValueChange={(v) => setForm({ ...form, class_id: v })}>
                <SelectTrigger><SelectValue placeholder={t('homework.selectClass')} /></SelectTrigger>
                <SelectContent>
                  {classes.map((c: any) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              <Button className="w-full" onClick={saveHomework}>{t('common.save')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {homework.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">{t('homework.noHomework')}</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {homework.map((h) => (
            <Card key={h.id} className="shadow-sm">
              <CardContent className="p-4 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{h.class_name}</span>
                    {h.due_date && <span className="text-xs text-muted-foreground">{t('homework.due')}: {format(new Date(h.due_date), 'dd MMM yyyy')}</span>}
                  </div>
                  <h3 className="font-semibold text-foreground">{h.title}</h3>
                  {h.description && <p className="text-sm text-muted-foreground mt-1">{h.description}</p>}
                </div>
                <Button variant="outline" size="icon" className="flex-shrink-0 ml-2" onClick={() => deleteHomework(h.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Homework;
