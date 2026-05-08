import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/hooks/useLanguage';

const ClassAttendanceSummary = () => {
  const { t } = useLanguage();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: summary = [] } = useQuery({
    queryKey: ['dashboard-class-attendance', today],
    queryFn: async () => {
      const [{ data: students }, { data: attendance }] = await Promise.all([
        supabase.from('students').select('id, class_id, classes(name)'),
        supabase.from('attendance').select('student_id, status').eq('date', today),
      ]);
      if (!students) return [];

      const classMap: Record<string, { name: string; total: number; present: number; absent: number }> = {};
      students.forEach((s: any) => {
        const cid = s.class_id || 'unassigned';
        const cname = s.classes?.name || t('classAttendance.unassigned');
        if (!classMap[cid]) classMap[cid] = { name: cname, total: 0, present: 0, absent: 0 };
        classMap[cid].total++;
      });

      (attendance ?? []).forEach((a: any) => {
        const student = students.find((s: any) => s.id === a.student_id);
        const cid = student?.class_id || 'unassigned';
        if (classMap[cid]) {
          if (a.status === 'present') classMap[cid].present++;
          else classMap[cid].absent++;
        }
      });

      return Object.values(classMap).sort((a, b) => a.name.localeCompare(b.name));
    },
  });

  if (summary.length === 0) return null;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-secondary" />
          {t('classAttendance.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">{t('classAttendance.class')}</TableHead>
              <TableHead className="text-center">{t('classAttendance.total')}</TableHead>
              <TableHead className="text-center">{t('classAttendance.present')}</TableHead>
              <TableHead className="text-center">{t('classAttendance.absent')}</TableHead>
              <TableHead className="text-center pr-6">{t('classAttendance.notMarked')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.map((row) => {
              const notMarked = row.total - row.present - row.absent;
              return (
                <TableRow key={row.name}>
                  <TableCell className="pl-6 font-medium text-foreground">{row.name}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{row.total}</TableCell>
                  <TableCell className="text-center font-semibold text-secondary">{row.present}</TableCell>
                  <TableCell className="text-center font-semibold text-destructive">{row.absent}</TableCell>
                  <TableCell className="text-center pr-6 text-muted-foreground">{notMarked > 0 ? notMarked : '—'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ClassAttendanceSummary;
