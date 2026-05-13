import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCog } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const Classes = () => {
  const { t } = useLanguage();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('*').order('name');
      return data ?? [];
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('id, class_id').eq('is_active', true);
      return data ?? [];
    },
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data } = await supabase.from('teachers').select('name, class_id').eq('is_active', true);
      return data ?? [];
    },
  });

  const getCount = (classId: string) => students.filter((s: any) => s.class_id === classId).length;
  const getTeacher = (classId: string) => {
    const tc = teachers.find((tc: any) => tc.class_id === classId);
    return tc ? (tc as any).name : t('classes.notAssigned');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('classes.title')}</h1>
        <p className="text-muted-foreground">{t('classes.subtitle')}</p>
      </div>

      {isLoading ? <p className="text-muted-foreground">{t('common.loading')}</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classes.map((c: any) => (
            <Card key={c.id} className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{c.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{getCount(c.id)} {t('classes.students')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserCog className="h-4 w-4" />
                  <span>{getTeacher(c.id)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Classes;
