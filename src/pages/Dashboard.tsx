import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CalendarCheck, IndianRupee, Megaphone, MessageSquare, Bus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/hooks/useLanguage';
import BrightStudents from '@/components/dashboard/BrightStudents';
import UpcomingBirthdays from '@/components/dashboard/UpcomingBirthdays';
import ClassAttendanceSummary from '@/components/dashboard/ClassAttendanceSummary';
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { data: totalStudents = 0 } = useQuery({
    queryKey: ['dashboard-students'],
    queryFn: async () => {
      const { count } = await supabase.from('students').select('*', { count: 'exact', head: true });
      return count ?? 0;
    },
  });

  const { data: attendanceToday = 0 } = useQuery({
    queryKey: ['dashboard-attendance', today],
    queryFn: async () => {
      const { count } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'present');
      return count ?? 0;
    },
  });

  const { data: pendingFees = 0 } = useQuery({
    queryKey: ['dashboard-pending-fees'],
    queryFn: async () => {
      const { count } = await supabase
        .from('fees')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'pending');
      return count ?? 0;
    },
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['dashboard-announcements'],
    queryFn: async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const stats = [
    { label: t('dashboard.totalStudents'), value: totalStudents, icon: Users, color: 'bg-primary' },
    { label: t('dashboard.presentToday'), value: attendanceToday, icon: CalendarCheck, color: 'bg-secondary' },
    { label: t('dashboard.pendingFees'), value: pendingFees, icon: IndianRupee, color: 'bg-warning' },
    { label: t('dashboard.announcements'), value: announcements.length, icon: Megaphone, color: 'bg-destructive' },
  ];

  

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.welcome')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('dashboard.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate('/fees')} className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-green-600" />
            <IndianRupee className="h-4 w-4" />
            {t('dashboard.sendFeeReminder')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/students')} className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-green-600" />
            <Bus className="h-4 w-4" />
            {t('dashboard.sendTransportInfo')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/exam-results')} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('dashboard.viewResults')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/fees')} className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            {t('dashboard.viewFeeReceipts')}
          </Button>
        </CardContent>
      </Card>

      <ClassAttendanceSummary />

      <UpcomingBirthdays />

      <BrightStudents />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('dashboard.recentAnnouncements')}</CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('dashboard.noAnnouncements')}</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                      {a.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(a.created_at), 'dd MMM yyyy')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mt-1">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">{a.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
