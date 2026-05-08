import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Shirt, FileText, Calendar, MessageSquare } from 'lucide-react';

interface Props {
  student: any;
  onClose: () => void;
}

function ItemRow({ label, issued, icon: Icon }: { label: string; issued: boolean; icon: any }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-md ${issued ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <Badge variant={issued ? 'default' : 'destructive'} className={issued ? 'bg-green-600' : ''}>
        {issued ? '✅ Issued' : '❌ Not Issued'}
      </Badge>
    </div>
  );
}

const IssuedItemsDetails = ({ student, onClose }: Props) => {
  if (!student) return null;

  return (
    <Dialog open={!!student} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>📦 Issued Items — {student.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <ItemRow label="Books" issued={student.books_issued} icon={BookOpen} />
          <ItemRow label="Uniform" issued={student.uniform_issued} icon={Shirt} />
          <ItemRow label="Study Materials" issued={student.materials_issued} icon={FileText} />

          {student.items_issue_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
              <Calendar className="h-4 w-4" />
              <span>Issue Date: {student.items_issue_date}</span>
            </div>
          )}
          {student.items_remarks && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>Remarks: {student.items_remarks}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IssuedItemsDetails;
