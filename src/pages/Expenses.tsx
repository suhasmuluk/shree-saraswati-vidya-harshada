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
import { useUserRole } from '@/hooks/useUserRole';
import { Plus, Trash2, TrendingUp, TrendingDown, IndianRupee, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const currentMonth = months[new Date().getMonth()];

const categories = [
  'Electricity',
  'Water',
  'Rent',
  'Maintenance',
  'Stationery',
  'Furniture',
  'Transport',
  'Salaries Advance',
  'Cleaning',
  'Internet / Phone',
  'Events / Functions',
  'Miscellaneous',
];

const Expenses = () => {
  const [open, setOpen] = useState(false);
  const [monthFilter, setMonthFilter] = useState(currentMonth);
  const [form, setForm] = useState({
    category: '',
    description: '',
    amount: '',
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    payment_mode: '',
  });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { canEdit, canDelete } = useUserRole();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      return data ?? [];
    },
  });

  // Fee income for profit/loss
  const { data: fees = [] } = useQuery({
    queryKey: ['fees-for-pnl'],
    queryFn: async () => {
      const { data } = await supabase
        .from('fees')
        .select('amount, month, payment_status')
        .eq('payment_status', 'paid');
      return data ?? [];
    },
  });

  const addExpense = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('expenses').insert({
        category: form.category,
        description: form.description || null,
        amount: parseFloat(form.amount),
        expense_date: form.expense_date,
        month: monthFilter,
        payment_mode: form.payment_mode || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setOpen(false);
      setForm({ category: '', description: '', amount: '', expense_date: format(new Date(), 'yyyy-MM-dd'), payment_mode: '' });
      toast({ title: t('expenses.added') });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: t('expenses.deleted') });
    },
  });

  const filteredExpenses = useMemo(() =>
    expenses.filter((e: any) => e.month === monthFilter),
    [expenses, monthFilter]
  );

  const totalExpenses = useMemo(() =>
    filteredExpenses.reduce((s: number, e: any) => s + Number(e.amount), 0),
    [filteredExpenses]
  );

  const totalIncome = useMemo(() =>
    fees.filter((f: any) => f.month === monthFilter).reduce((s: number, f: any) => s + Number(f.amount), 0),
    [fees, monthFilter]
  );

  const profitLoss = totalIncome - totalExpenses;

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e: any) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('expenses.title')}</h1>
          <p className="text-muted-foreground">{t('expenses.subtitle')}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canEdit && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-1" />{t('expenses.add')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('expenses.addTitle')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue placeholder={t('expenses.selectCategory')} /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={t('expenses.description')}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder={t('expenses.amount')}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                  <Input
                    type="date"
                    value={form.expense_date}
                    onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                  />
                  <Select value={form.payment_mode} onValueChange={(v) => setForm({ ...form, payment_mode: v })}>
                    <SelectTrigger><SelectValue placeholder={t('fees.paymentMode')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{t('fees.cash')}</SelectItem>
                      <SelectItem value="upi">{t('fees.upi')}</SelectItem>
                      <SelectItem value="online">{t('fees.online')}</SelectItem>
                      <SelectItem value="cheque">{t('fees.cheque')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    className="w-full"
                    onClick={() => addExpense.mutate()}
                    disabled={!form.category || !form.amount || addExpense.isPending}
                  >
                    {addExpense.isPending ? t('common.saving') : t('common.save')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-secondary w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{totalIncome.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">{t('expenses.income')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-destructive w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{totalExpenses.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">{t('expenses.totalExpenses')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`${profitLoss >= 0 ? 'bg-primary' : 'bg-destructive'} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <IndianRupee className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {profitLoss >= 0 ? '+' : ''}₹{profitLoss.toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-muted-foreground">{t('expenses.profitLoss')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">{t('expenses.allExpenses')}</TabsTrigger>
          <TabsTrigger value="summary">{t('expenses.categorySummary')}</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <p className="p-6 text-muted-foreground">{t('common.loading')}</p>
              ) : filteredExpenses.length === 0 ? (
                <p className="p-6 text-muted-foreground">{t('expenses.noExpenses')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('expenses.date')}</TableHead>
                      <TableHead>{t('expenses.categoryLabel')}</TableHead>
                      <TableHead>{t('expenses.description')}</TableHead>
                      <TableHead>{t('expenses.amount')}</TableHead>
                      <TableHead>{t('fees.paymentMode')}</TableHead>
                      {canDelete && <TableHead></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((exp: any) => (
                      <TableRow key={exp.id}>
                        <TableCell>{format(new Date(exp.expense_date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{exp.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{exp.description || '—'}</TableCell>
                        <TableCell className="font-semibold">₹{Number(exp.amount).toLocaleString('en-IN')}</TableCell>
                        <TableCell className="capitalize">{exp.payment_mode || '—'}</TableCell>
                        {canDelete && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(exp.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{t('expenses.categorySummary')} — {monthFilter}</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryTotals.length === 0 ? (
                <p className="text-muted-foreground">{t('expenses.noExpenses')}</p>
              ) : (
                <div className="space-y-3">
                  {categoryTotals.map(([cat, total]) => (
                    <div key={cat} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{cat}</span>
                      </div>
                      <span className="font-bold">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t-2 font-bold text-lg">
                    <span>{t('expenses.totalExpenses')}</span>
                    <span>₹{totalExpenses.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('expenses.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('expenses.deleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteExpense.mutate(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Expenses;
