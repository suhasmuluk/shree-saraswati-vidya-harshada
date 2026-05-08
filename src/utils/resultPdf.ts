import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface SubjectResult {
  subject: string;
  marks_obtained: number;
  total_marks: number;
  grade?: string;
}

interface ResultData {
  studentName: string;
  className: string;
  examName: string;
  examDate: string;
  subjects: SubjectResult[];
  remarks?: string;
}

const SCHOOL_NAME = 'Shree Saraswati Vidya English Medium School';

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 35) return 'D';
  return 'F';
}

export function generateResultPdf(data: ResultData, download = true): jsPDF {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(SCHOOL_NAME, 105, 18, { align: 'center' });
  doc.setFontSize(12);
  doc.text('EXAMINATION RESULT', 105, 30, { align: 'center' });

  doc.setTextColor(0, 0, 0);

  // Student info
  doc.setFillColor(245, 245, 245);
  doc.rect(15, 48, 180, 24, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Student: ${data.studentName}`, 20, 57);
  doc.text(`Class: ${data.className}`, 120, 57);
  doc.text(`Exam: ${data.examName}`, 20, 67);
  doc.text(`Date: ${data.examDate ? format(new Date(data.examDate), 'dd MMM yyyy') : '-'}`, 120, 67);

  // Table header
  const tableY = 82;
  doc.setFillColor(37, 99, 235);
  doc.rect(15, tableY, 180, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Subject', 20, tableY + 7);
  doc.text('Marks', 100, tableY + 7);
  doc.text('Total', 130, tableY + 7);
  doc.text('Grade', 165, tableY + 7);

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  let totalObtained = 0;
  let totalMax = 0;

  data.subjects.forEach((sub, i) => {
    const y = tableY + 10 + (i + 1) * 9;
    if (i % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, y - 6, 180, 9, 'F');
    }
    const pct = sub.total_marks > 0 ? (sub.marks_obtained / sub.total_marks) * 100 : 0;
    const grade = sub.grade || calculateGrade(pct);
    doc.text(sub.subject, 20, y);
    doc.text(String(sub.marks_obtained), 100, y);
    doc.text(String(sub.total_marks), 130, y);
    doc.text(grade, 165, y);
    totalObtained += sub.marks_obtained;
    totalMax += sub.total_marks;
  });

  // Totals
  const totalY = tableY + 10 + (data.subjects.length + 1) * 9 + 4;
  doc.setDrawColor(37, 99, 235);
  doc.line(15, totalY - 4, 195, totalY - 4);

  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const overallGrade = calculateGrade(percentage);
  const resultStatus = percentage >= 35 ? 'PASS' : 'FAIL';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Total: ${totalObtained} / ${totalMax}`, 20, totalY + 4);
  doc.text(`Percentage: ${percentage.toFixed(1)}%`, 20, totalY + 13);
  doc.text(`Grade: ${overallGrade}`, 100, totalY + 13);
  doc.text(`Result: ${resultStatus}`, 150, totalY + 13);

  // Remarks
  if (data.remarks) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Teacher Remarks: ${data.remarks}`, 20, totalY + 26);
  }

  // Footer
  const footerY = totalY + (data.remarks ? 38 : 28);
  doc.setDrawColor(200, 200, 200);
  doc.line(15, footerY, 195, footerY);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('This is a computer-generated result. No signature required.', 105, footerY + 8, { align: 'center' });

  if (download) {
    doc.save(`Result_${data.studentName}_${data.examName}.pdf`);
  }
  return doc;
}

export function generateResultWhatsAppMessage(data: ResultData): string {
  let totalObtained = 0;
  let totalMax = 0;
  data.subjects.forEach(s => {
    totalObtained += s.marks_obtained;
    totalMax += s.total_marks;
  });
  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const grade = calculateGrade(percentage);

  return `Dear Parent,

The exam result for *${data.studentName}* – Class *${data.className}* has been published.

Exam: ${data.examName}
Total Marks: ${totalObtained} / ${totalMax}
Percentage: ${percentage.toFixed(1)}%
Grade: ${grade}
Result: ${percentage >= 35 ? 'PASS' : 'FAIL'}

Please download the detailed result from the school app.

Regards,
${SCHOOL_NAME}`;
}
