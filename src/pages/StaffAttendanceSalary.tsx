import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { CalendarCheck, IndianRupee, Check, X, Clock, Download } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

const months = [
  'January 2026', 'February 2026', 'March 2026', 'April 2026',
  'May 2026', 'June 2026', 'July 2026', 'August 2026',
  'September 2026', 'October 2026', 'November 2026', 'December 2026',
];

const StaffAttendanceSalary = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = useState('March 2026');
  const [editingSalary, setEditingSalary] = useState<string | null>(null);
  const [salaryInput, setSalaryInput] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const updateBaseSalaryMutation = useMutation({
    mutationFn: async ({ personType, personId, newSalary }: { personType: string; personId: string; newSalary: number }) => {
      const table = personType === 'teacher' ? 'teachers' : 'staff';
      const { error } = await supabase.from(table).update({ base_salary: newSalary }).eq('id', personId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setEditingSalary(null);
      toast({ title: 'Base salary updated' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data } = await supabase.from('teachers').select('*, classes(name)').order('name');
      return data ?? [];
    },
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await supabase.from('staff').select('*').eq('is_active', true).order('name');
      return data ?? [];
    },
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['staff-attendance', selectedDate],
    queryFn: async () => {
      const { data } = await supabase.from('staff_attendance').select('*').eq('date', selectedDate);
      return data ?? [];
    },
  });

  const { data: salaries = [] } = useQuery({
    queryKey: ['salaries', selectedMonth],
    queryFn: async () => {
      const { data } = await supabase.from('salaries').select('*').eq('month', selectedMonth);
      return data ?? [];
    },
  });

  const { data: monthlyAttendance = [] } = useQuery({
    queryKey: ['staff-attendance-month', selectedMonth],
    queryFn: async () => {
      const monthIndex = months.findIndex(m => m === selectedMonth);
      const [, year] = selectedMonth.split(' ');
      const startDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
      const endDay = new Date(parseInt(year), monthIndex + 1, 0).getDate();
      const endDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${endDay}`;
      const { data } = await supabase.from('staff_attendance').select('*')
        .gte('date', startDate).lte('date', endDate);
      return data ?? [];
    },
  });

  const getAttendanceStatus = (personType: string, personId: string) => {
    const record = attendance.find((a: any) => a.person_type === personType && a.person_id === personId);
    return record ? (record as any).status : null;
  };

  const markMutation = useMutation({
    mutationFn: async ({ personType, personId, status }: { personType: string; personId: string; status: string }) => {
      const existing = attendance.find((a: any) => a.person_type === personType && a.person_id === personId);
      if (existing) {
        const { error } = await supabase.from('staff_attendance').update({ status }).eq('id', (existing as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('staff_attendance').insert({
          person_type: personType, person_id: personId, date: selectedDate, status
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-attendance', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['staff-attendance-month'] });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const getMonthlyStats = (personType: string, personId: string) => {
    const records = monthlyAttendance.filter((a: any) => a.person_type === personType && a.person_id === personId);
    const present = records.filter((r: any) => r.status === 'present').length;
    const halfDays = records.filter((r: any) => r.status === 'half_day').length;
    const absent = records.filter((r: any) => r.status === 'absent').length;
    const leave = records.filter((r: any) => r.status === 'leave').length;
    return { present, halfDays, absent, leave, total: records.length };
  };

  const salarySaveMutation = useMutation({
    mutationFn: async ({ personType, personId, baseSalary }: { personType: string; personId: string; baseSalary: number }) => {
      const stats = getMonthlyStats(personType, personId);
      const [, year] = selectedMonth.split(' ');
      const monthIndex = months.findIndex(m => m === selectedMonth);
      const totalWorkingDays = new Date(parseInt(year), monthIndex + 1, 0).getDate();
      const workingDays = Math.min(totalWorkingDays, 26);
      const effectiveDays = stats.present + (stats.halfDays * 0.5);
      const perDay = baseSalary / workingDays;
      const deduction = Math.round((workingDays - effectiveDays) * perDay);
      const netSalary = Math.max(0, baseSalary - deduction);

      const payload = {
        person_type: personType, person_id: personId, month: selectedMonth,
        base_salary: baseSalary, working_days: workingDays, present_days: stats.present,
        half_days: stats.halfDays, deduction: Math.max(0, deduction), net_salary: netSalary,
      };

      const existing = salaries.find((s: any) => s.person_type === personType && s.person_id === personId);
      if (existing) {
        const { error } = await supabase.from('salaries').update(payload).eq('id', (existing as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('salaries').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries', selectedMonth] });
      toast({ title: 'Salary calculated' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const markPaidMutation = useMutation({
    mutationFn: async (salaryId: string) => {
      const { error } = await supabase.from('salaries').update({
        payment_status: 'paid', payment_date: format(new Date(), 'yyyy-MM-dd'),
      }).eq('id', salaryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries', selectedMonth] });
      toast({ title: 'Marked as paid' });
    },
  });

  const allPeople = useMemo(() => [
    ...teachers.map((tc: any) => ({ ...tc, personType: 'teacher', role: (tc.classes as any)?.name ? `Teacher - ${(tc.classes as any).name}` : 'Teacher' })),
    ...staff.map((s: any) => ({ ...s, personType: 'staff', role: s.role })),
  ], [teachers, staff]);

  const generateAllSalaries = () => {
    allPeople.forEach(p => {
      salarySaveMutation.mutate({
        personType: p.personType, personId: p.id,
        baseSalary: p.base_salary ?? (p.personType === 'teacher' ? 15000 : 10000),
      });
    });
  };

  const downloadSalaryPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Shree Saraswati Vidya - Salary Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Month: ${selectedMonth}`, 14, 28);
    let y = 38;
    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text('Name', 14, y); doc.text('Role', 65, y); doc.text('Base', 110, y);
    doc.text('Present', 130, y); doc.text('Deduction', 152, y); doc.text('Net', 178, y);
    y += 6; doc.setFont('helvetica', 'normal');
    allPeople.forEach(p => {
      const salary = salaries.find((s: any) => s.person_type === p.personType && s.person_id === p.id) as any;
      if (!salary) return;
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(p.name, 14, y); doc.text(p.role?.substring(0, 20) ?? '', 65, y);
      doc.text(`₹${salary.base_salary}`, 110, y); doc.text(`${salary.present_days}d`, 130, y);
      doc.text(`₹${salary.deduction}`, 152, y); doc.text(`₹${salary.net_salary}`, 178, y);
      y += 5;
    });
    doc.save(`salary-report-${selectedMonth.replace(' ', '-')}.pdf`);
  };

  const statusBtn = (personType: string, personId: string, status: string, icon: React.ReactNode, color: string) => {
    const current = getAttendanceStatus(personType, personId);
    const isActive = current === status;
    return (
      <Button variant={isActive ? 'default' : 'outline'} size="icon"
        className={`h-8 w-8 ${isActive ? color : ''}`}
        onClick={() => markMutation.mutate({ personType, personId, status })}
        disabled={markMutation.isPending}>
        {icon}
      </Button>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('salary.title')}</h1>
        <p className="text-muted-foreground">{t('salary.subtitle')}</p>
      </div>

      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance" className="gap-1.5"><CalendarCheck className="h-4 w-4" />{t('salary.dailyAttendance')}</TabsTrigger>
          <TabsTrigger value="salary" className="gap-1.5"><IndianRupee className="h-4 w-4" />{t('salary.salary')}</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-48" />
            <p className="text-sm text-muted-foreground">{allPeople.length} {t('common.people')}</p>
          </div>

          <div className="grid gap-2">
            {allPeople.map((p) => {
              const currentStatus = getAttendanceStatus(p.personType, p.id);
              return (
                <Card key={`${p.personType}-${p.id}`} className="shadow-sm">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground text-sm truncate">{p.name}</h3>
                        <Badge variant="secondary" className="text-[10px] shrink-0">{p.role}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.phone}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {statusBtn(p.personType, p.id, 'present', <Check className="h-3.5 w-3.5" />, 'bg-green-600 hover:bg-green-700')}
                      {statusBtn(p.personType, p.id, 'half_day', <Clock className="h-3.5 w-3.5" />, 'bg-amber-500 hover:bg-amber-600')}
                      {statusBtn(p.personType, p.id, 'absent', <X className="h-3.5 w-3.5" />, 'bg-red-600 hover:bg-red-700')}
                      {currentStatus && (
                        <Badge variant="outline" className="text-[10px] ml-1 capitalize">{currentStatus.replace('_', ' ')}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="salary" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={generateAllSalaries} disabled={salarySaveMutation.isPending}>
                <IndianRupee className="h-4 w-4 mr-1" />{t('salary.calculateAll')}
              </Button>
              {salaries.length > 0 && (
                <Button variant="outline" onClick={downloadSalaryPDF}>
                  <Download className="h-4 w-4 mr-1" />{t('salary.downloadPDF')}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{t('salary.totalStaff')}</p>
              <p className="text-2xl font-bold text-foreground">{allPeople.length}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{t('salary.totalPayable')}</p>
              <p className="text-2xl font-bold text-foreground">₹{salaries.reduce((sum: number, s: any) => sum + Number(s.net_salary), 0).toLocaleString()}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{t('fees.paid')}</p>
              <p className="text-2xl font-bold text-green-600">{salaries.filter((s: any) => s.payment_status === 'paid').length}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{t('fees.pending')}</p>
              <p className="text-2xl font-bold text-amber-600">{salaries.filter((s: any) => s.payment_status === 'pending').length}</p>
            </CardContent></Card>
          </div>

          <div className="grid gap-2">
            {allPeople.map((p) => {
              const salary = salaries.find((s: any) => s.person_type === p.personType && s.person_id === p.id) as any;
              const stats = getMonthlyStats(p.personType, p.id);
              return (
                <Card key={`sal-${p.personType}-${p.id}`} className="shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground text-sm">{p.name}</h3>
                          <Badge variant="secondary" className="text-[10px]">{p.role}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          {editingSalary === `${p.personType}-${p.id}` ? (
                            <div className="flex items-center gap-1">
                              <span>{t('salary.baseSalary')}: ₹</span>
                              <Input type="number" value={salaryInput}
                                onChange={(e) => setSalaryInput(e.target.value)}
                                className="h-6 w-24 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateBaseSalaryMutation.mutate({ personType: p.personType, personId: p.id, newSalary: Number(salaryInput) });
                                  } else if (e.key === 'Escape') {
                                    setEditingSalary(null);
                                  }
                                }}
                                autoFocus
                              />
                              <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => updateBaseSalaryMutation.mutate({ personType: p.personType, personId: p.id, newSalary: Number(salaryInput) })}>
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setEditingSalary(null)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="flex items-center gap-1 cursor-pointer hover:text-foreground" onClick={() => {
                              setEditingSalary(`${p.personType}-${p.id}`);
                              setSalaryInput(String(p.base_salary ?? 0));
                            }}>
                              {t('salary.baseSalary')}: ₹{(p.base_salary ?? 0).toLocaleString()}
                              <Pencil className="h-3 w-3" />
                            </span>
                          )}
                          <span>{t('attendance.present')}: {stats.present}d</span>
                          <span>{t('teacherSummary.halfDay')}: {stats.halfDays}d</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {salary ? (
                          <>
                            <div className="text-right">
                              <p className="font-bold text-foreground text-sm">₹{Number(salary.net_salary).toLocaleString()}</p>
                              <p className="text-[10px] text-muted-foreground">{t('salary.deduction')}: ₹{salary.deduction}</p>
                            </div>
                            <Badge variant={salary.payment_status === 'paid' ? 'default' : 'destructive'}
                              className={`text-[10px] ${salary.payment_status === 'paid' ? 'bg-secondary' : ''}`}>
                              {salary.payment_status === 'paid' ? t('fees.paid') : t('fees.pending')}
                            </Badge>
                            {salary.payment_status === 'pending' && (
                              <Button size="sm" variant="outline" className="text-xs h-7"
                                onClick={() => markPaidMutation.mutate(salary.id)}>
                                {t('salary.markPaid')}
                              </Button>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">{t('salary.notCalculated')}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffAttendanceSalary;
