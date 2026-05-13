import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { Plus, Search, Download, MessageSquare, FileText, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { generateResultPdf, generateResultWhatsAppMessage } from '@/utils/resultPdf';

interface ResultForm {
  student_id: string;
  exam_name: string;
  subject: string;
  marks_obtained: string;
  total_marks: string;
  grade: string;
  remarks: string;
  result_status: string;
  exam_date: string;
}

const emptyForm: ResultForm = {
  student_id: '', exam_name: '', subject: '', marks_obtained: '', total_marks: '100',
  grade: '', remarks: '', result_status: 'pass', exam_date: new Date().toISOString().split('T')[0],
};

const ExamResults = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [examFilter, setExamFilter] = useState('all');
  const [form, setForm] = useState<ResultForm>(emptyForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('*, classes(name)').eq('is_active', true).order('name');
      return data ?? [];
    },
  });

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['exam-results'],
    queryFn: async () => {
      const { data } = await supabase.from('exam_results').select('*, students(name, parent_phone, classes(name))').order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('exam_results').insert({
        student_id: form.student_id,
        exam_name: form.exam_name,
        subject: form.subject,
        marks_obtained: parseFloat(form.marks_obtained),
        total_marks: parseFloat(form.total_marks),
        grade: form.grade || null,
        remarks: form.remarks || null,
        result_status: form.result_status,
        exam_date: form.exam_date,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
      toast({ title: t('results.added') });
      setOpen(false);
      setForm(emptyForm);
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('exam_results').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
      toast({ title: 'Result deleted' });
    },
  });

  // Group results by student+exam for PDF generation
  const examNames = [...new Set(results.map((r: any) => r.exam_name))];

  const filteredResults = results.filter((r: any) => {
    const matchSearch = (r.students as any)?.name?.toLowerCase().includes(search.toLowerCase());
    const matchExam = examFilter === 'all' || r.exam_name === examFilter;
    return matchSearch && matchExam;
  });

  // Group by student_id + exam_name
  const grouped: Record<string, any[]> = {};
  filteredResults.forEach((r: any) => {
    const key = `${r.student_id}__${r.exam_name}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  const handleDownloadResult = (group: any[]) => {
    const first = group[0];
    const student = first.students as any;
    generateResultPdf({
      studentName: student?.name || '-',
      className: student?.classes?.name || '-',
      examName: first.exam_name,
      examDate: first.exam_date,
      subjects: group.map((r: any) => ({
        subject: r.subject,
        marks_obtained: r.marks_obtained,
        total_marks: r.total_marks,
        grade: r.grade,
      })),
      remarks: first.remarks || '',
    });
  };

  const handleWhatsApp = (group: any[]) => {
    const first = group[0];
    const student = first.students as any;
    const phone = student?.parent_phone?.replace(/\D/g, '') || '';
    const msg = generateResultWhatsAppMessage({
      studentName: student?.name || '-',
      className: student?.classes?.name || '-',
      examName: first.exam_name,
      examDate: first.exam_date,
      subjects: group.map((r: any) => ({
        subject: r.subject,
        marks_obtained: r.marks_obtained,
        total_marks: r.total_marks,
        grade: r.grade,
      })),
    });
    const url = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('results.title')}</h1>
          <p className="text-muted-foreground">{t('results.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />{t('results.addResult')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('results.addResult')}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                <SelectTrigger><SelectValue placeholder={t('fees.selectStudent')} /></SelectTrigger>
                <SelectContent>
                  {students.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({(s.classes as any)?.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder={t('results.examName')} value={form.exam_name} onChange={(e) => setForm({ ...form, exam_name: e.target.value })} required />
              <Input placeholder={t('results.subject')} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder={t('results.marksObtained')} value={form.marks_obtained} onChange={(e) => setForm({ ...form, marks_obtained: e.target.value })} required />
                <Input type="number" placeholder={t('results.totalMarks')} value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: e.target.value })} required />
              </div>
              <Input placeholder={t('results.remarks')} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.result_status} onValueChange={(v) => setForm({ ...form, result_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pass">{t('results.pass')}</SelectItem>
                    <SelectItem value="fail">{t('results.fail')}</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('results.searchStudent')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={examFilter} onValueChange={setExamFilter}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('results.allExams')}</SelectItem>
            {examNames.map((e: any) => (<SelectItem key={e} value={e}>{e}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <p className="text-muted-foreground">{t('common.loading')}</p> : Object.keys(grouped).length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">{t('results.noResults')}</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {Object.entries(grouped).map(([key, group]) => {
            const first = group[0] as any;
            const student = first.students as any;
            const totalObt = group.reduce((a: number, r: any) => a + Number(r.marks_obtained), 0);
            const totalMax = group.reduce((a: number, r: any) => a + Number(r.total_marks), 0);
            const pct = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;

            return (
              <Card key={key} className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{student?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{student?.classes?.name} • {first.exam_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={pct >= 35 ? 'default' : 'destructive'} className={pct >= 35 ? 'bg-secondary' : ''}>
                        {pct.toFixed(1)}% • {pct >= 35 ? t('results.pass') : t('results.fail')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mb-3">
                    {group.map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between bg-muted/50 rounded px-2 py-1">
                        <span className="text-muted-foreground">{r.subject}</span>
                        <span className="font-medium">{r.marks_obtained}/{r.total_marks}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => handleDownloadResult(group)}>
                      <Download className="h-4 w-4 mr-1" /> {t('results.downloadPdf')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleWhatsApp(group)}>
                      <MessageSquare className="h-4 w-4 mr-1 text-green-600" /> {t('results.sendWhatsApp')}
                    </Button>
                    {group.map((r: any) => (
                      <Button key={r.id} size="sm" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} title={`Delete ${r.subject}`}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExamResults;
