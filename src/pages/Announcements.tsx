import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { Plus, Trash2, Megaphone, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const Announcements = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'general' });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('announcements').insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-announcements'] });
      toast({ title: 'Announcement posted' });
      setOpen(false);
      setForm({ title: '', content: '', type: 'general' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({ title: 'Announcement deleted' });
    },
  });

  const typeColors: Record<string, string> = {
    holiday: 'bg-warning text-warning-foreground',
    event: 'bg-primary text-primary-foreground',
    general: 'bg-muted text-muted-foreground',
  };

  const shareOnWhatsApp = (announcement: any) => {
    const text = `📢 *${announcement.title}*\n\n${announcement.content}\n\n— Shree Saraswati Vidya English Medium School`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('announcements.title')}</h1>
          <p className="text-muted-foreground">{t('announcements.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />{t('announcements.addAnnouncement')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('announcements.postTitle')}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <Input placeholder={t('announcements.titleField')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder={t('announcements.content')} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={4} />
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t('announcements.general')}</SelectItem>
                  <SelectItem value="holiday">{t('announcements.holiday')}</SelectItem>
                  <SelectItem value="event">{t('announcements.event')}</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? t('announcements.posting') : t('announcements.post')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <p className="text-muted-foreground">{t('common.loading')}</p> : announcements.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">{t('announcements.noAnnouncements')}</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {announcements.map((a) => (
            <Card key={a.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={typeColors[a.type ?? 'general']}>{a.type}</Badge>
                      <span className="text-xs text-muted-foreground">{format(new Date(a.created_at), 'dd MMM yyyy')}</span>
                    </div>
                    <h3 className="font-semibold text-foreground">{a.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                  </div>
                   <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                     <Button variant="outline" size="icon" onClick={() => shareOnWhatsApp(a)} title="Share on WhatsApp">
                       <Share2 className="h-4 w-4 text-green-600" />
                     </Button>
                     <Button variant="outline" size="icon" onClick={() => deleteMutation.mutate(a.id)}>
                       <Trash2 className="h-4 w-4 text-destructive" />
                     </Button>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
