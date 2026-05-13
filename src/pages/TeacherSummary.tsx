import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { format, endOfMonth } from 'date-fns';
import { UserCog, CalendarCheck, BookOpen, IndianRupee } from 'lucide-react';

const TeacherSummary = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const { t } = useLanguage();

  const monthStart = `${selectedMonth}-01`;
  const monthEnd = format(endOfMonth(new Date(monthStart)), 'yyyy-MM-dd');
  const monthLabel = format(new Date(monthStart), 'MMMM yyyy');

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data } = await supabase.from('teachers').select('*, classes(name)').eq('is_active', true).order('name');
      return data ?? [];
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('*').order('name');
      return data ?? [];
    },
  });

  const { data: staffAttendance = [] } = useQuery({
    queryKey: ['teacher-attendance-month', selectedMonth],
    queryFn: async () => {
      const { data } = await supabase.from('staff_attendance').select('*')
        .eq('person_type', 'teacher').gte('date', monthStart).lte('date', monthEnd);
      return data ?? [];
    },
  });

  const { data: studentAttendance = [] } = useQuery({
    queryKey: ['student-attendance-taken', selectedMonth],
    queryFn: async () => {
      const { data } = await supabase.from('attendance').select('date, student_id, students(class_id)')
        .gte('date', monthStart).lte('date', monthEnd);
      return data ?? [];
    },
  });

  const { data: salaries = [] } = useQuery({
    queryKey: ['teacher-salaries', monthLabel],
    queryFn: async () => {
      const { data } = await supabase.from('salaries').select('*')
        .eq('person_type', 'teacher').eq('month', monthLabel);
      return data ?? [];
    },
  });

  const summaries = useMemo(() => {
    return teachers.map((tc: any) => {
      const att = staffAttendance.filter((a: any) => a.person_id === tc.id);
      const present = att.filter((a: any) => a.status === 'present').length;
      const halfDay = att.filter((a: any) => a.status === 'half_day').length;
      const absent = att.filter((a: any) => a.status === 'absent').length;
      const classId = tc.class_id;
      const attendanceDates = classId
        ? new Set(studentAttendance.filter((a: any) => (a.students as any)?.class_id === classId).map((a: any) => a.date)).size
        : 0;
      const salary = salaries.find((s: any) => s.person_id === tc.id) as any;
      return {
        ...tc,
        className: (tc.classes as any)?.name || t('classes.notAssigned'),
        present, halfDay, absent,
        totalAttendance: att.length,
        attendanceTaken: attendanceDates,
        salary,
      };
    });
  }, [teachers, staffAttendance, studentAttendance, salaries, t]);

  const totalPresent = summaries.reduce((s, tc) => s + tc.present, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('teacherSummary.title')}</h1>
        <p className="text-muted-foreground">{t('teacherSummary.subtitle')}</p>
      </div>

      <div className="flex items-center gap-3">
        <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-48" />
        <span className="text-sm text-muted-foreground">{monthLabel}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <UserCog className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{teachers.length}</p>
          <p className="text-xs text-muted-foreground">{t('teacherSummary.teachers')}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <CalendarCheck className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{totalPresent}</p>
          <p className="text-xs text-muted-foreground">{t('teacherSummary.totalPresentDays')}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <BookOpen className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{classes.length}</p>
          <p className="text-xs text-muted-foreground">{t('teacherSummary.classes')}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <IndianRupee className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">
            ₹{salaries.reduce((s: number, sal: any) => s + Number(sal.net_salary), 0).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{t('teacherSummary.totalSalary')}</p>
        </CardContent></Card>
      </div>

      <div className="grid gap-3">
        {summaries.map((tc) => (
          <Card key={tc.id} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{tc.name}</h3>
                    <Badge variant="secondary" className="text-[10px]">{tc.className}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{tc.phone}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <p className="text-lg font-bold text-secondary">{tc.present}</p>
                    <p className="text-[10px] text-muted-foreground">{t('attendance.present')}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <p className="text-lg font-bold text-amber-600">{tc.halfDay}</p>
                    <p className="text-[10px] text-muted-foreground">{t('teacherSummary.halfDay')}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <p className="text-lg font-bold text-destructive">{tc.absent}</p>
                    <p className="text-[10px] text-muted-foreground">{t('attendance.absent')}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <p className="text-lg font-bold text-primary">{tc.attendanceTaken}</p>
                    <p className="text-[10px] text-muted-foreground">{t('teacherSummary.attTaken')}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted">
                    <p className="text-lg font-bold text-foreground">
                      {tc.salary ? `₹${Number(tc.salary.net_salary).toLocaleString()}` : '-'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{t('salary.salary')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherSummary;
