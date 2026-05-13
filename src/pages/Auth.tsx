import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';
import schoolLogo from '@/assets/school-logo.png';

const ADMIN_EMAIL = 'admin@school.com';

const Auth = () => {
  const [password, setPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20">
            <img src={schoolLogo} alt="SSVEMS Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Shree Saraswati Vidya
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">English Medium School</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showPasswordForm ? (
            <div className="flex flex-col items-center space-y-4">
              <button
                type="button"
                onClick={() => setShowPasswordForm(true)}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-accent transition-all"
                aria-label="Sign in as Admin"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
                <span className="text-base font-semibold text-foreground">Admin Login</span>
              </button>
              <p className="text-xs text-muted-foreground text-center">
                Click the icon above to sign in as Administrator
              </p>
            </div>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="flex flex-col items-center space-y-2 mb-2">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Administrator</p>
              </div>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPassword('');
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
