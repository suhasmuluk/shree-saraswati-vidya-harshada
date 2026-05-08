import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'manager' | 'viewer';

export const useUserRole = () => {
  const { user } = useAuth();

  const { data: role, isLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.rpc('get_user_role', { _user_id: user.id });
      return (data as AppRole) ?? 'viewer';
    },
    enabled: !!user?.id,
  });

  return {
    role: role ?? null,
    isLoading,
    isAdmin: role === 'admin',
    isManager: role === 'manager' || role === 'admin',
    isViewer: role === 'viewer',
    canEdit: role === 'admin' || role === 'manager',
    canDelete: role === 'admin',
  };
};
