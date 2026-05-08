import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cake } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { parseISO, setYear, getMonth, getDate } from 'date-fns';

const UpcomingBirthdays = () => {
  const { t } = useLanguage();

  const { data: birthdays = [] } = useQuery({
    queryKey: ['todays-birthdays'],
    queryFn: async () => {
      const { data: students } = await supabase.from('students').select('id, name, date_of_birth, classes(name)');

      const today = new Date();
      const todayMonth = getMonth(today);
      const todayDate = getDate(today);

      return (students ?? [])
        .filter((s: any) => {
          if (!s.date_of_birth) return false;
          const dob = parseISO(s.date_of_birth);
          return getMonth(dob) === todayMonth && getDate(dob) === todayDate;
        })
        .map((s: any) => ({
          id: s.id,
          name: s.name,
          className: s.classes?.name,
        }));
    },
  });

  if (birthdays.length === 0) return null;

  return (
    <Card className="shadow-sm border-warning/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Cake className="w-5 h-5 text-warning" />
          🎉 {t('birthday.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {birthdays.map((b) => (
            <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-warning/20 ring-1 ring-warning/40">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-warning text-primary-foreground">
                <Cake className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">{b.name}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-xs">{t('birthday.student')}</Badge>
                  {b.className && <span className="text-xs text-muted-foreground">{b.className}</span>}
                </div>
                <p className="text-xs font-bold text-warning mt-0.5">🎂 {t('birthday.today')}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingBirthdays;
