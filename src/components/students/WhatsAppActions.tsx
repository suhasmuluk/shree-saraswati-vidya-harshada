import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { MessageSquare } from 'lucide-react';

interface WhatsAppFeeProps {
  studentName: string;
  className: string;
  amount: number;
  month: string;
  parentPhone: string;
  dueDate?: string;
}

export function WhatsAppFeeButton({ studentName, className, amount, month, parentPhone, dueDate }: WhatsAppFeeProps) {
  const { t } = useLanguage();
  
  const sendFeeMessage = () => {
    const msg = `Dear Parent, the fee details for *${studentName}* – Class *${className}* are:\n\n` +
      `📋 Month: ${month}\n` +
      `💰 Amount: ₹${amount.toLocaleString()}\n` +
      (dueDate ? `📅 Due Date: ${dueDate}\n\n` : '\n') +
      `Please pay at the earliest. Thank you.\n– Shree Saraswati Vidya School`;
    
    const phone = parentPhone.replace(/\D/g, '');
    const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <Button size="sm" variant="outline" onClick={sendFeeMessage} title={t('whatsapp.sendFee')} className="text-green-600 border-green-200 hover:bg-green-50">
      <MessageSquare className="h-4 w-4" />
    </Button>
  );
}

interface WhatsAppTransportProps {
  studentName: string;
  transportType: string;
  transportRoute: string;
  parentPhone: string;
}

export function WhatsAppTransportButton({ studentName, transportType, transportRoute, parentPhone }: WhatsAppTransportProps) {
  const { t } = useLanguage();
  
  const sendTransportMessage = () => {
    const msg = `Transport details for *${studentName}*:\n\n` +
      `🚌 Vehicle: ${transportType}\n` +
      `📍 Route: ${transportRoute}\n\n` +
      `For any queries, contact the school office.\n– Shree Saraswati Vidya School`;
    
    const phone = parentPhone.replace(/\D/g, '');
    const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <Button size="sm" variant="outline" onClick={sendTransportMessage} title={t('whatsapp.sendTransport')} className="text-green-600 border-green-200 hover:bg-green-50">
      <MessageSquare className="h-4 w-4" />
    </Button>
  );
}
