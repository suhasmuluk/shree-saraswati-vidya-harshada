import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface FeeReceiptData {
  receiptNumber: string;
  studentName: string;
  className: string;
  parentName: string;
  month: string;
  amount: number;
  paymentStatus: string;
  paymentDate: string | null;
  paymentMode: string | null;
  balanceDue?: number;
}

const SCHOOL_NAME = 'Shree Saraswati Vidya English Medium School';

export function generateFeeReceiptPdf(data: FeeReceiptData, download = true): jsPDF {
  const doc = new jsPDF();

  // Header background
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(SCHOOL_NAME, 105, 18, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('FEE RECEIPT', 105, 30, { align: 'center' });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Receipt info bar
  doc.setFillColor(245, 245, 245);
  doc.rect(15, 48, 180, 12, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Receipt No: ${data.receiptNumber}`, 20, 56);
  doc.text(`Date: ${format(new Date(), 'dd MMM yyyy')}`, 150, 56);

  // Student details
  const startY = 72;
  const lineH = 10;
  const details: [string, string][] = [
    ['Student Name', data.studentName],
    ['Class', data.className],
    ['Parent Name', data.parentName],
    ['Fee Month', data.month],
    ['Amount Paid', `₹${data.amount.toLocaleString()}`],
    ['Payment Status', data.paymentStatus.toUpperCase()],
    ['Payment Date', data.paymentDate ? format(new Date(data.paymentDate), 'dd MMM yyyy') : '-'],
    ['Payment Mode', data.paymentMode?.toUpperCase() || '-'],
  ];

  if (data.balanceDue !== undefined && data.balanceDue > 0) {
    details.push(['Balance Due', `₹${data.balanceDue.toLocaleString()}`]);
  }

  doc.setFontSize(11);
  details.forEach(([label, value], i) => {
    const y = startY + i * lineH;
    if (i % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, y - 6, 180, lineH, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 90, y);
  });

  // Footer
  const footerY = startY + details.length * lineH + 20;
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(15, footerY, 195, footerY);
  
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('This is a computer-generated receipt. No signature required.', 105, footerY + 8, { align: 'center' });
  doc.text(SCHOOL_NAME, 105, footerY + 14, { align: 'center' });

  if (download) {
    doc.save(`FeeReceipt_${data.studentName}_${data.month}.pdf`);
  }
  return doc;
}

export function generateFeeWhatsAppMessage(data: FeeReceiptData): string {
  return `Dear Parent,
We have received the fee payment for *${data.studentName}* – Class *${data.className}*.

Amount Paid: ₹${data.amount.toLocaleString()}
Receipt No: ${data.receiptNumber}
Month: ${data.month}
Payment Mode: ${data.paymentMode?.toUpperCase() || 'N/A'}

Thank you.
${SCHOOL_NAME}`;
}
