import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, CalendarDays, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const Events = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '' });
  const { toast } = useToast();
  const { t } = useLanguage();

  const [events, setEvents] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('school-events') || '[]'); } catch { return []; }
  });

  const saveEvent = () => {
    if (!form.title || !form.date) return;
    const newItem = { id: Date.now().toString(), ...form, created_at: new Date().toISOString() };
    const updated = [newItem, ...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEvents(updated);
    localStorage.setItem('school-events', JSON.stringify(updated));
    setOpen(false);
    setForm({ title: '', description: '', date: '' });
    toast({ title: 'Event added' });
  };

  const deleteEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    localStorage.setItem('school-events', JSON.stringify(updated));
    toast({ title: 'Event deleted' });
  };

  const isUpcoming = (date: string) => new Date(date) >= new Date(new Date().toDateString());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('events.title')}</h1>
          <p className="text-muted-foreground">{t('events.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />{t('events.addEvent')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('events.addEvent')}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder={t('events.eventTitle')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder={t('homework.description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <Button className="w-full" onClick={saveEvent}>{t('events.saveEvent')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">{t('events.noEvents')}</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {events.map((e) => (
            <Card key={e.id} className="shadow-sm">
              <CardContent className="p-4 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">{format(new Date(e.date), 'dd MMM yyyy, EEEE')}</span>
                    <Badge variant={isUpcoming(e.date) ? 'default' : 'secondary'}>
                      {isUpcoming(e.date) ? t('events.upcoming') : t('events.past')}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground">{e.title}</h3>
                  {e.description && <p className="text-sm text-muted-foreground mt-1">{e.description}</p>}
                </div>
                <Button variant="outline" size="icon" className="flex-shrink-0 ml-2" onClick={() => deleteEvent(e.id)}>
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

export default Events;
