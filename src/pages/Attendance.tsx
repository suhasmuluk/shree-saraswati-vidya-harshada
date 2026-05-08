import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { format, endOfMonth } from 'date-fns';
import { Check, X, CalendarCheck, BarChart3, History, Users, Clock } from 'lucide-react';

const Attendance = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [monthFilter, setMonthFilter] = useState(format(new Date(), 'yyyy-MM'));
  const [historyStudent, setHistoryStudent] = useState<string | null>(null);
  const [staffDate, setStaffDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [staffFilter, setStaffFilter] = useState<'all' | 'teacher' | 'staff'>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // ─── Student Attendance Queries ───
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('*').order('name');
      return data ?? [];
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ['attendance-students', selectedClass],
    queryFn: async () => {
      let query = supabase.from('students').select('*, classes(name)').order('name');
      if (selectedClass !== 'all') query = query.eq('class_id', selectedClass);
      const { data } = await query;
      return data ?? [];
    },
  });

  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['attendance', date, selectedClass],
    queryFn: async () => {
      const studentIds = students.map((s) => s.id);
      if (studentIds.length === 0) return [];
      const { data } = await supabase.from('attendance').select('*').eq('date', date).in('student_id', studentIds);
      return data ?? [];
    },
    enabled: students.length > 0,
  });

  const monthStart = `${monthFilter}-01`;
  const monthEnd = format(endOfMonth(new Date(monthStart)), 'yyyy-MM-dd');

  const { data: monthlyAttendance = [] } = useQuery({
    queryKey: ['monthly-attendance', monthFilter, selectedClass],
    queryFn: async () => {
      const studentIds = students.map((s) => s.id);
      if (studentIds.length === 0) return [];
      const { data } = await supabase.from('attendance').select('*')
        .gte('date', monthStart).lte('date', monthEnd).in('student_id', studentIds);
      return data ?? [];
    },
    enabled: students.length > 0,
  });

  const { data: studentHistory = [] } = useQuery({
    queryKey: ['student-history', historyStudent],
    queryFn: async () => {
      if (!historyStudent) return [];
      const { data } = await supabase.from('attendance').select('*')
        .eq('student_id', historyStudent).order('date', { ascending: false }).limit(60);
      return data ?? [];
    },
    enabled: !!historyStudent,
  });

  // ─── Staff/Teacher Attendance Queries ───
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data } = await supabase.from('teachers').select('*, classes(name)').order('name');
      return data ?? [];
    },
  });

  const { data: staffMembers = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await supabase.from('staff').select('*').order('name');
      return data ?? [];
    },
  });

  const { data: staffAttendance = [] } = useQuery({
    queryKey: ['staff-attendance', staffDate],
    queryFn: async () => {
      const { data } = await supabase.from('staff_attendance').select('*').eq('date', staffDate);
      return data ?? [];
    },
  });

  // ─── Student Attendance Mutations & Helpers ───
  const markMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: string }) => {
      const existing = attendanceRecords.find((a) => a.student_id === studentId);
      if (existing) {
        const { error } = await supabase.from('attendance').update({ status }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('attendance').insert({ student_id: studentId, date, status });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-attendance'] });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  // ─── Staff Attendance Mutation ───
  const staffMarkMutation = useMutation({
    mutationFn: async ({ personType, personId, status }: { personType: string; personId: string; status: string }) => {
      const existing = staffAttendance.find((a: any) => a.person_type === personType && a.person_id === personId);
      if (existing) {
        const { error } = await supabase.from('staff_attendance').update({ status }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('staff_attendance').insert({
          person_type: personType, person_id: personId, date: staffDate, status
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['staff-attendance-month'] });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const getStatus = (studentId: string) => attendanceRecords.find((a) => a.student_id === studentId)?.status;
  const presentCount = attendanceRecords.filter((a) => a.status === 'present').length;
  const absentCount = attendanceRecords.filter((a) => a.status === 'absent').length;

  const getStaffStatus = (personType: string, personId: string) => {
    const record = staffAttendance.find((a: any) => a.person_type === personType && a.person_id === personId);
    return record ? (record as any).status : null;
  };

  const monthlyStats = useMemo(() => {
    const stats: Record<string, { present: number; absent: number; total: number }> = {};
    students.forEach((s: any) => {
      const records = monthlyAttendance.filter((a: any) => a.student_id === s.id);
      stats[s.id] = {
        present: records.filter((r: any) => r.status === 'present').length,
        absent: records.filter((r: any) => r.status === 'absent').length,
        total: records.length,
      };
    });
    return stats;
  }, [students, monthlyAttendance]);

  const classWiseStats = useMemo(() => {
    const grouped: Record<string, { className: string; total: number; present: number; absent: number; students: number }> = {};
    students.forEach((s: any) => {
      const cn = (s.classes as any)?.name || 'Unassigned';
      if (!grouped[cn]) grouped[cn] = { className: cn, total: 0, present: 0, absent: 0, students: 0 };
      grouped[cn].students++;
      const st = monthlyStats[s.id];
      if (st) {
        grouped[cn].present += st.present;
        grouped[cn].absent += st.absent;
        grouped[cn].total += st.total;
      }
    });
    return Object.values(grouped);
  }, [students, monthlyStats]);

  // Staff attendance stats
  const staffPresentCount = staffAttendance.filter((a: any) => a.status === 'present').length;
  const staffAbsentCount = staffAttendance.filter((a: any) => a.status === 'absent').length;
  const staffHalfDayCount = staffAttendance.filter((a: any) => a.status === 'half_day').length;
  const staffLeaveCount = staffAttendance.filter((a: any) => a.status === 'leave').length;

  // Filtered staff list
  const filteredStaffList = useMemo(() => {
    const teacherList = teachers.map((t: any) => ({ ...t, _type: 'teacher' as const, _role: (t.classes as any)?.name || 'Teacher' }));
    const staffList = staffMembers.map((s: any) => ({ ...s, _type: 'staff' as const, _role: s.role }));
    if (staffFilter === 'teacher') return teacherList;
    if (staffFilter === 'staff') return staffList;
    return [...teacherList, ...staffList];
  }, [teachers, staffMembers, staffFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('attendance.title')}</h1>
        <p className="text-muted-foreground">{t('attendance.subtitle')}</p>
      </div>

      <Tabs defaultValue="daily">
        <TabsList className="flex-wrap">
          <TabsTrigger value="daily" className="gap-1.5"><CalendarCheck className="h-4 w-4" />{t('attendance.daily')}</TabsTrigger>
          <TabsTrigger value="staff" className="gap-1.5"><Users className="h-4 w-4" />Staff Attendance</TabsTrigger>
          <TabsTrigger value="monthly" className="gap-1.5"><BarChart3 className="h-4 w-4" />{t('attendance.monthlyReport')}</TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5"><History className="h-4 w-4" />{t('attendance.studentHistory')}</TabsTrigger>
        </TabsList>

        {/* ─── Daily Student Attendance ─── */}
        <TabsContent value="daily" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-48" />
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('students.allClasses')}</SelectItem>
                {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-lg bg-secondary/10 text-secondary font-semibold text-sm">{t('attendance.present')}: {presentCount}</div>
            <div className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive font-semibold text-sm">{t('attendance.absent')}: {absentCount}</div>
            <div className="px-4 py-2 rounded-lg bg-muted text-muted-foreground font-semibold text-sm">{t('attendance.total')}: {students.length}</div>
          </div>

          {students.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">{t('attendance.noStudents')}</CardContent></Card>
          ) : (
            <div className="grid gap-2">
              {students.map((s: any) => {
                const status = getStatus(s.id);
                return (
                  <Card key={s.id} className="shadow-sm">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate">{s.name}</h3>
                        <p className="text-xs text-muted-foreground">{(s.classes as any)?.name}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant={status === 'present' ? 'default' : 'outline'}
                          className={status === 'present' ? 'bg-secondary hover:bg-secondary/90' : ''}
                          onClick={() => markMutation.mutate({ studentId: s.id, status: 'present' })}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant={status === 'absent' ? 'destructive' : 'outline'}
                          onClick={() => markMutation.mutate({ studentId: s.id, status: 'absent' })}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── Staff & Teacher Attendance ─── */}
        <TabsContent value="staff" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input type="date" value={staffDate} onChange={(e) => setStaffDate(e.target.value)} className="sm:w-48" />
            <Select value={staffFilter} onValueChange={(v) => setStaffFilter(v as any)}>
              <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="staff">Support Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 rounded-lg bg-secondary/10 text-secondary font-semibold text-sm">Present: {staffPresentCount}</div>
            <div className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive font-semibold text-sm">Absent: {staffAbsentCount}</div>
            <div className="px-4 py-2 rounded-lg bg-accent/50 text-accent-foreground font-semibold text-sm">Half Day: {staffHalfDayCount}</div>
            <div className="px-4 py-2 rounded-lg bg-muted text-muted-foreground font-semibold text-sm">Leave: {staffLeaveCount}</div>
            <div className="px-4 py-2 rounded-lg bg-muted text-muted-foreground font-semibold text-sm">Total: {filteredStaffList.length}</div>
          </div>

          {filteredStaffList.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No teachers or staff found. Add them in Classes & Staff module.</CardContent></Card>
          ) : (
            <div className="grid gap-2">
              {filteredStaffList.map((person: any) => {
                const status = getStaffStatus(person._type, person.id);
                return (
                  <Card key={`${person._type}-${person.id}`} className="shadow-sm">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate">{person.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {person._type === 'teacher' ? `Teacher • ${person._role}` : `Staff • ${person._role}`}
                        </p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Button size="sm" variant={status === 'present' ? 'default' : 'outline'}
                          className={status === 'present' ? 'bg-secondary hover:bg-secondary/90' : ''}
                          onClick={() => staffMarkMutation.mutate({ personType: person._type, personId: person.id, status: 'present' })}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant={status === 'absent' ? 'destructive' : 'outline'}
                          onClick={() => staffMarkMutation.mutate({ personType: person._type, personId: person.id, status: 'absent' })}>
                          <X className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant={status === 'half_day' ? 'default' : 'outline'}
                          className={status === 'half_day' ? 'bg-accent text-accent-foreground' : ''}
                          onClick={() => staffMarkMutation.mutate({ personType: person._type, personId: person.id, status: 'half_day' })}>
                          <Clock className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── Monthly Report ─── */}
        <TabsContent value="monthly" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="sm:w-48" />
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('students.allClasses')}</SelectItem>
                {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {classWiseStats.map((cs) => (
              <Card key={cs.className}>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground text-sm">{cs.className}</h3>
                  <p className="text-xs text-muted-foreground">{cs.students} {t('classes.students').toLowerCase()}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <Badge variant="secondary">{cs.present} {t('attendance.present')}</Badge>
                    <Badge variant="destructive">{cs.absent} {t('attendance.absent')}</Badge>
                    {cs.total > 0 && (
                      <span className="font-semibold text-foreground">
                        {Math.round((cs.present / cs.total) * 100)}%
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">{t('attendance.studentWise')}</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">{t('attendance.student')}</th>
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">{t('attendance.class')}</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">{t('attendance.present')}</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">{t('attendance.absent')}</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s: any) => {
                      const st = monthlyStats[s.id] || { present: 0, absent: 0, total: 0 };
                      const pct = st.total > 0 ? Math.round((st.present / st.total) * 100) : 0;
                      return (
                        <tr key={s.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-medium text-foreground">{s.name}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{(s.classes as any)?.name}</td>
                          <td className="py-2 px-2 text-center">{st.present}</td>
                          <td className="py-2 px-2 text-center">{st.absent}</td>
                          <td className="py-2 px-2 text-center">
                            <Badge variant={pct >= 75 ? 'secondary' : 'destructive'} className="text-[10px]">
                              {pct}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Student History ─── */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <Select value={historyStudent ?? ''} onValueChange={setHistoryStudent}>
            <SelectTrigger className="sm:w-72"><SelectValue placeholder={t('attendance.selectStudent')} /></SelectTrigger>
            <SelectContent>
              {students.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.name} - {(s.classes as any)?.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {historyStudent && studentHistory.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('attendance.history')} ({studentHistory.length} {t('attendance.records')})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold text-foreground">{studentHistory.length}</p>
                    <p className="text-xs text-muted-foreground">{t('attendance.totalDays')}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/10">
                    <p className="text-2xl font-bold text-secondary">{studentHistory.filter((h: any) => h.status === 'present').length}</p>
                    <p className="text-xs text-muted-foreground">{t('attendance.present')}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-destructive/10">
                    <p className="text-2xl font-bold text-destructive">{studentHistory.filter((h: any) => h.status === 'absent').length}</p>
                    <p className="text-xs text-muted-foreground">{t('attendance.absent')}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold text-foreground">
                      {studentHistory.length > 0 ? Math.round((studentHistory.filter((h: any) => h.status === 'present').length / studentHistory.length) * 100) : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">{t('attendance.percentage')}</p>
                  </div>
                </div>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {studentHistory.map((h: any) => (
                    <div key={h.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50">
                      <span className="text-sm text-foreground">{format(new Date(h.date), 'dd MMM yyyy (EEEE)')}</span>
                      <Badge variant={h.status === 'present' ? 'secondary' : 'destructive'} className="text-[10px] capitalize">
                        {h.status === 'present' ? t('attendance.present') : t('attendance.absent')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : historyStudent ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">{t('attendance.noRecords')}</CardContent></Card>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Attendance;
