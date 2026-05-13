import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Users, IndianRupee, CalendarCheck, Wallet } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import jsPDF from 'jspdf';
import { format, endOfMonth } from 'date-fns';

const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const { t } = useLanguage();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('*, classes(name)').eq('is_deleted', false).order('name');
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

  const { data: fees = [] } = useQuery({
    queryKey: ['fees'],
    queryFn: async () => {
      const { data } = await supabase.from('fees').select('*, students(name, classes(name))').order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const monthStart = `${selectedMonth}-01`;
  const monthEnd = format(endOfMonth(new Date(monthStart)), 'yyyy-MM-dd');

  const { data: attendance = [] } = useQuery({
    queryKey: ['report-attendance', selectedMonth],
    queryFn: async () => {
      const { data } = await supabase.from('attendance').select('*, students(name, classes(name))')
        .gte('date', monthStart).lte('date', monthEnd);
      return data ?? [];
    },
  });

  const { data: salaries = [] } = useQuery({
    queryKey: ['report-salaries'],
    queryFn: async () => {
      const { data } = await supabase.from('salaries').select('*');
      return data ?? [];
    },
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data } = await supabase.from('teachers').select('*, classes(name)').eq('is_deleted', false).order('name');
      return data ?? [];
    },
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await supabase.from('staff').select('*').eq('is_deleted', false).order('name');
      return data ?? [];
    },
  });

  const pdfHeader = (doc: any, title: string) => {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Shree Saraswati Vidya English Medium School', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(title, 105, 23, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy')}`, 105, 29, { align: 'center' });
    doc.line(15, 32, 195, 32);
    return 40;
  };

  const exportStudentList = () => {
    const doc = new jsPDF();
    let y = pdfHeader(doc, 'Student List Report');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Sr.', 15, y); doc.text('Student Name', 25, y); doc.text('Class', 85, y);
    doc.text('Parent Name', 115, y); doc.text('Phone', 165, y);
    y += 6; doc.setFont('helvetica', 'normal');
    students.forEach((s: any, i: number) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(`${i + 1}`, 15, y); doc.text(s.name?.substring(0, 25) || '', 25, y);
      doc.text((s.classes as any)?.name || '', 85, y); doc.text(s.parent_name?.substring(0, 20) || '', 115, y);
      doc.text(s.parent_phone || '', 165, y); y += 5;
    });
    doc.save('Student_List_Report.pdf');
  };

  const exportAttendanceReport = () => {
    const doc = new jsPDF();
    const monthLabel = format(new Date(monthStart), 'MMMM yyyy');
    let y = pdfHeader(doc, `Attendance Report - ${monthLabel}`);
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('Class-wise Summary', 15, y); y += 6;
    doc.setFontSize(9);
    doc.text('Class', 15, y); doc.text('Students', 65, y); doc.text('Present', 95, y);
    doc.text('Absent', 125, y); doc.text('Attendance %', 155, y);
    y += 5; doc.setFont('helvetica', 'normal');
    classes.forEach((c: any) => {
      const classStudents = students.filter((s: any) => s.class_id === c.id);
      const classAttendance = attendance.filter((a: any) => classStudents.some((s: any) => s.id === a.student_id));
      const present = classAttendance.filter((a: any) => a.status === 'present').length;
      const total = classAttendance.length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      doc.text(c.name, 15, y); doc.text(`${classStudents.length}`, 65, y);
      doc.text(`${present}`, 95, y); doc.text(`${total - present}`, 125, y);
      doc.text(`${pct}%`, 155, y); y += 5;
    });
    y += 8; doc.setFont('helvetica', 'bold');
    doc.text('Student-wise Detail', 15, y); y += 6;
    doc.text('Student', 15, y); doc.text('Class', 75, y); doc.text('Present', 115, y);
    doc.text('Absent', 140, y); doc.text('%', 170, y);
    y += 5; doc.setFont('helvetica', 'normal');
    students.forEach((s: any) => {
      if (y > 275) { doc.addPage(); y = 20; }
      const recs = attendance.filter((a: any) => a.student_id === s.id);
      const present = recs.filter((r: any) => r.status === 'present').length;
      const pct = recs.length > 0 ? Math.round((present / recs.length) * 100) : 0;
      doc.text(s.name?.substring(0, 25) || '', 15, y); doc.text((s.classes as any)?.name || '', 75, y);
      doc.text(`${present}`, 115, y); doc.text(`${recs.length - present}`, 140, y);
      doc.text(`${pct}%`, 170, y); y += 5;
    });
    doc.save(`Attendance_Report_${monthLabel.replace(' ', '_')}.pdf`);
  };

  const exportFeeReport = () => {
    const doc = new jsPDF();
    let y = pdfHeader(doc, 'Fee Collection Report');
    const totalCollected = fees.filter((f: any) => f.payment_status === 'paid').reduce((a: number, f: any) => a + f.amount, 0);
    const totalPendingAmt = fees.filter((f: any) => f.payment_status === 'pending').reduce((a: number, f: any) => a + f.amount, 0);
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text(`Total Collected: Rs. ${totalCollected.toLocaleString()}`, 15, y - 2);
    doc.text(`Total Pending: Rs. ${totalPendingAmt.toLocaleString()}`, 105, y - 2);
    y += 6; doc.setFontSize(9);
    doc.text('Student', 15, y); doc.text('Month', 75, y); doc.text('Amount', 105, y);
    doc.text('Status', 130, y); doc.text('Date', 160, y);
    y += 5; doc.setFont('helvetica', 'normal');
    fees.forEach((f: any) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text((f.students as any)?.name?.substring(0, 25) || '', 15, y);
      doc.text(f.month || '', 75, y); doc.text(`Rs. ${f.amount}`, 105, y);
      doc.text(f.payment_status, 130, y);
      doc.text(f.payment_date ? format(new Date(f.payment_date), 'dd/MM/yy') : '-', 160, y); y += 5;
    });
    doc.save('Fee_Collection_Report.pdf');
  };

  const exportPendingFees = () => {
    const pending = fees.filter((f: any) => f.payment_status === 'pending');
    const doc = new jsPDF();
    let y = pdfHeader(doc, `Pending Fees Report (${pending.length} records, Rs. ${pending.reduce((a: number, f: any) => a + f.amount, 0).toLocaleString()})`);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text('Student', 15, y); doc.text('Class', 85, y); doc.text('Month', 125, y); doc.text('Amount', 160, y);
    y += 6; doc.setFont('helvetica', 'normal');
    pending.forEach((f: any) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text((f.students as any)?.name?.substring(0, 28) || '', 15, y);
      doc.text((f.students as any)?.classes?.name || '', 85, y);
      doc.text(f.month || '', 125, y); doc.text(`Rs. ${f.amount}`, 160, y); y += 5;
    });
    doc.save('Pending_Fees_Report.pdf');
  };

  const exportSalaryReport = () => {
    const doc = new jsPDF();
    let y = pdfHeader(doc, 'Staff Salary Report');
    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text('Name', 15, y); doc.text('Role', 65, y); doc.text('Base', 110, y);
    doc.text('Present', 130, y); doc.text('Deduction', 152, y); doc.text('Net', 178, y);
    y += 5; doc.setFont('helvetica', 'normal');
    const allPeople = [
      ...teachers.map((t: any) => ({ ...t, personType: 'teacher', role: (t.classes as any)?.name ? `Teacher - ${(t.classes as any).name}` : 'Teacher' })),
      ...staff.map((s: any) => ({ ...s, personType: 'staff', role: s.role })),
    ];
    allPeople.forEach((p: any) => {
      const salary = salaries.find((s: any) => s.person_type === p.personType && s.person_id === p.id) as any;
      if (!salary) return;
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(p.name, 15, y); doc.text(p.role?.substring(0, 20) ?? '', 65, y);
      doc.text(`₹${salary.base_salary}`, 110, y); doc.text(`${salary.present_days}d`, 130, y);
      doc.text(`₹${salary.deduction}`, 152, y); doc.text(`₹${salary.net_salary}`, 178, y); y += 5;
    });
    doc.save('Staff_Salary_Report.pdf');
  };

  const totalCollected = fees.filter((f: any) => f.payment_status === 'paid').reduce((a: number, f: any) => a + f.amount, 0);
  const totalPending = fees.filter((f: any) => f.payment_status === 'pending').reduce((a: number, f: any) => a + f.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('reports.title')}</h1>
        <p className="text-muted-foreground">{t('reports.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <Users className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{students.length}</p>
          <p className="text-xs text-muted-foreground">{t('nav.students')}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <IndianRupee className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">₹{totalCollected.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{t('reports.collected')}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <IndianRupee className="h-5 w-5 mx-auto text-destructive mb-1" />
          <p className="text-2xl font-bold text-destructive">₹{totalPending.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{t('fees.pending')}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Wallet className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{teachers.length + staff.length}</p>
          <p className="text-xs text-muted-foreground">{t('reports.staff')}</p>
        </CardContent></Card>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{t('reports.attendanceMonth')}:</span>
        <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-48" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />{t('reports.studentList')}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{students.length} {t('reports.studentsAcross')}</p>
            <Button onClick={exportStudentList} className="w-full"><Download className="w-4 h-4 mr-2" />{t('reports.download')}</Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CalendarCheck className="h-4 w-4" />{t('reports.attendanceReport')}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{t('reports.classWiseStudent')}</p>
            <Button onClick={exportAttendanceReport} className="w-full"><Download className="w-4 h-4 mr-2" />{t('reports.download')}</Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><IndianRupee className="h-4 w-4" />{t('reports.feeCollection')}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{fees.length} {t('reports.feeRecords')}</p>
            <Button onClick={exportFeeReport} className="w-full"><Download className="w-4 h-4 mr-2" />{t('reports.download')}</Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><IndianRupee className="h-4 w-4" />{t('reports.pendingFees')}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{fees.filter((f: any) => f.payment_status === 'pending').length} {t('reports.pendingPayments')}</p>
            <Button onClick={exportPendingFees} variant="destructive" className="w-full"><Download className="w-4 h-4 mr-2" />{t('reports.download')}</Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wallet className="h-4 w-4" />{t('reports.salaryReport')}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{t('reports.salaryDetails')}</p>
            <Button onClick={exportSalaryReport} className="w-full"><Download className="w-4 h-4 mr-2" />{t('reports.download')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
