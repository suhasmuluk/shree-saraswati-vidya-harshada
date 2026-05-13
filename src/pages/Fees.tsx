import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { Plus, Search, Download, MessageSquare, Users, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { WhatsAppFeeButton } from '@/components/students/WhatsAppActions';
import { generateFeeReceiptPdf, generateFeeWhatsAppMessage } from '@/utils/feeReceiptPdf';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const currentMonth = months[new Date().getMonth()];

const Fees = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState(currentMonth);
  const [form, setForm] = useState({ student_id: '', month: currentMonth, amount: '', payment_status: 'pending', payment_date: '', payment_mode: '' });
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

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('*, classes(name)').eq('is_active', true).order('name');
      return data ?? [];
    },
  });

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ['fees'],
    queryFn: async () => {
      const { data } = await supabase.from('fees').select('*, students(name, parent_phone, parent_name, classes(name))').order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        student_id: form.student_id,
        month: form.month,
        amount: parseFloat(form.amount),
        payment_status: form.payment_status,
        payment_date: form.payment_status === 'paid' ? (form.payment_date || format(new Date(), 'yyyy-MM-dd')) : null,
        payment_mode: form.payment_status === 'paid' ? form.payment_mode : null,
      };
      const { error } = await supabase.from('fees').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-pending-fees'] });
      toast({ title: 'Fee record added', description: `${form.month} fee saved successfully` });
      // Switch filters to show the newly added record
      setMonthFilter(form.month);
      setStatusFilter('all');
      setOpen(false);
      setForm({ student_id: '', month: currentMonth, amount: '', payment_status: 'pending', payment_date: '', payment_mode: '' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async ({ studentIds, month, amount }: { studentIds: string[], month: string, amount: number }) => {
      const payloads = studentIds.map(sid => ({
        student_id: sid,
        month,
        amount,
        payment_status: 'pending' as const,
      }));
      const { error } = await supabase.from('fees').insert(payloads);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-pending-fees'] });
      toast({ title: 'Fee records created for all missing students' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const markPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fees').update({
        payment_status: 'paid',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        payment_mode: 'cash',
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-pending-fees'] });
      toast({ title: 'Marked as paid' });
    },
  });

  const revertPendingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fees').update({
        payment_status: 'pending',
        payment_date: null,
        payment_mode: null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-pending-fees'] });
      toast({ title: 'Reverted to pending' });
    },
  });

  // Students who have NO fee record for the selected month
  const studentsWithoutFees = useMemo(() => {
    const studentIdsWithFee = new Set(
      fees.filter((f: any) => f.month === monthFilter).map((f: any) => f.student_id)
    );
    return students.filter((s: any) => {
      const noFee = !studentIdsWithFee.has(s.id);
      const matchesClass = classFilter === 'all' || s.class_id === classFilter;
      const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase());
      return noFee && matchesClass && matchesSearch;
    });
  }, [fees, students, monthFilter, classFilter, search]);

  const filtered = useMemo(() => {
    return fees.filter((f: any) => {
      const matchesSearch = (f.students as any)?.name?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || f.payment_status === statusFilter;
      const matchesMonth = monthFilter === 'all' || f.month === monthFilter;
      const matchesClass = classFilter === 'all' || 
        students.find((s: any) => s.id === f.student_id)?.class_id === classFilter;
      return matchesSearch && matchesStatus && matchesMonth && matchesClass;
    });
  }, [fees, search, statusFilter, monthFilter, classFilter, students]);

  const totalPending = fees.filter((f: any) => f.payment_status === 'pending').reduce((acc: number, f: any) => acc + f.amount, 0);

  const downloadReceipt = (fee: any) => {
    const student = fee.students as any;
    generateFeeReceiptPdf({
      receiptNumber: `RCP-${fee.id.substring(0, 8).toUpperCase()}`,
      studentName: student?.name || '-',
      className: student?.classes?.name || '-',
      parentName: student?.parent_name || '-',
      month: fee.month,
      amount: fee.amount,
      paymentStatus: fee.payment_status,
      paymentDate: fee.payment_date,
      paymentMode: fee.payment_mode,
    });
  };

  const sendReceiptWhatsApp = (fee: any) => {
    const student = fee.students as any;
    const phone = (student?.parent_phone || '').replace(/\D/g, '');
    const msg = generateFeeWhatsAppMessage({
      receiptNumber: `RCP-${fee.id.substring(0, 8).toUpperCase()}`,
      studentName: student?.name || '-',
      className: student?.classes?.name || '-',
      parentName: student?.parent_name || '-',
      month: fee.month,
      amount: fee.amount,
      paymentStatus: fee.payment_status,
      paymentDate: fee.payment_date,
      paymentMode: fee.payment_mode,
    });
    const url = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleBulkCreate = (amount: number) => {
    const ids = studentsWithoutFees.map((s: any) => s.id);
    if (ids.length === 0) return;
    bulkCreateMutation.mutate({ studentIds: ids, month: monthFilter, amount });
  };

  // Filter students in form dropdown by class filter
  const formStudents = classFilter === 'all' ? students : students.filter((s: any) => s.class_id === classFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('fees.title')}</h1>
          <p className="text-muted-foreground">{t('fees.totalPending')}: ₹{totalPending.toLocaleString()}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />{t('fees.recordFee')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('fees.recordPayment')}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                <SelectTrigger><SelectValue placeholder={t('fees.selectStudent')} /></SelectTrigger>
                <SelectContent>
                  {formStudents.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({(s.classes as any)?.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={form.month} onValueChange={(v) => setForm({ ...form, month: v })}>
                <SelectTrigger><SelectValue placeholder={t('fees.selectMonth')} /></SelectTrigger>
                <SelectContent>
                  {months.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                </SelectContent>
              </Select>
              <Input type="number" placeholder={t('fees.amount')} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              <Select value={form.payment_status} onValueChange={(v) => setForm({ ...form, payment_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t('fees.pending')}</SelectItem>
                  <SelectItem value="paid">{t('fees.paid')}</SelectItem>
                </SelectContent>
              </Select>
              {form.payment_status === 'paid' && (
                <>
                  <Input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
                  <Select value={form.payment_mode} onValueChange={(v) => setForm({ ...form, payment_mode: v })}>
                    <SelectTrigger><SelectValue placeholder={t('fees.paymentMode')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{t('fees.cash')}</SelectItem>
                      <SelectItem value="upi">{t('fees.upi')}</SelectItem>
                      <SelectItem value="online">{t('fees.online')}</SelectItem>
                      <SelectItem value="cheque">{t('fees.cheque')}</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('fees.searchStudent')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="All Classes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c: any) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('fees.allStatus')}</SelectItem>
            <SelectItem value="paid">{t('fees.paid')}</SelectItem>
            <SelectItem value="pending">{t('fees.pending')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records">Fee Records</TabsTrigger>
          <TabsTrigger value="missing" className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Missing ({monthFilter !== 'all' ? studentsWithoutFees.length : '—'})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="mt-4">
          {isLoading ? <p className="text-muted-foreground">{t('common.loading')}</p> : filtered.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">{t('fees.noRecords')}</CardContent></Card>
          ) : (
            <div className="grid gap-2">
              {filtered.map((f: any) => (
                <Card key={f.id} className="shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{(f.students as any)?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {f.month} • ₹{f.amount} • {(f.students as any)?.classes?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <Badge variant={f.payment_status === 'paid' ? 'default' : 'destructive'} className={f.payment_status === 'paid' ? 'bg-secondary' : ''}>
                        {f.payment_status === 'paid' ? t('fees.paid') : t('fees.pending')}
                      </Badge>
                      <WhatsAppFeeButton
                        studentName={(f.students as any)?.name || ''}
                        className={(f.students as any)?.classes?.name || ''}
                        amount={f.amount}
                        month={f.month}
                        parentPhone={(f.students as any)?.parent_phone || ''}
                      />
                      <Button size="sm" variant="outline" onClick={() => downloadReceipt(f)} title="Download Receipt">
                        <Download className="h-4 w-4" />
                      </Button>
                      {f.payment_status === 'paid' && (
                        <Button size="sm" variant="outline" onClick={() => sendReceiptWhatsApp(f)} title="Send Receipt on WhatsApp">
                          <MessageSquare className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {f.payment_status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => markPaidMutation.mutate(f.id)}>
                          {t('fees.markPaid')}
                        </Button>
                      )}
                      {f.payment_status === 'paid' && (
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => revertPendingMutation.mutate(f.id)}>
                          Revert
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="missing" className="mt-4">
          {monthFilter === 'all' ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Select a specific month to see students without fee records.</CardContent></Card>
          ) : studentsWithoutFees.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">All students have fee records for {monthFilter}. 🎉</CardContent></Card>
          ) : (
            <div className="space-y-4">
              <Card className="border-warning/50 bg-warning/5">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-warning" />
                    <span className="font-medium text-foreground">
                      {studentsWithoutFees.length} students have no fee record for {monthFilter}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Amount (₹)"
                      className="w-32"
                      id="bulk-amount"
                    />
                    <Button
                      size="sm"
                      disabled={bulkCreateMutation.isPending}
                      onClick={() => {
                        const el = document.getElementById('bulk-amount') as HTMLInputElement;
                        const amt = parseFloat(el?.value);
                        if (!amt || amt <= 0) {
                          toast({ title: 'Enter a valid amount', variant: 'destructive' });
                          return;
                        }
                        handleBulkCreate(amt);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create All Pending
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-2">
                {studentsWithoutFees.map((s: any) => (
                  <Card key={s.id} className="shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{s.name}</h3>
                        <p className="text-sm text-muted-foreground">{(s.classes as any)?.name} • {s.parent_name}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setForm({ ...form, student_id: s.id, month: monthFilter });
                          setOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Fee
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Fees;
