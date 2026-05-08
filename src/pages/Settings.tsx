import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Badge } from '@/components/ui/badge';
import { School, Mail, Shield } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <div className="grid gap-4">
        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><School className="h-4 w-4" />{t('settings.schoolInfo')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">{t('settings.schoolName')}:</span><p className="font-medium text-foreground">Shree Saraswati Vidya English Medium School</p></div>
              <div><span className="text-muted-foreground">{t('settings.type')}:</span><p className="font-medium text-foreground">Pre-School (Playgroup to Senior KG)</p></div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" />{t('settings.account')}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">{t('settings.email')}:</span><p className="font-medium text-foreground">{user?.email}</p></div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t('settings.role')}:</span>
              <Badge variant="default">Admin</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />{t('settings.systemInfo')}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Powered by <a href="https://s2ms.tech/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">S2MS Tech</a> • Version 1.0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
