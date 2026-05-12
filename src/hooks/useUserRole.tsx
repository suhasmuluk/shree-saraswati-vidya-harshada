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
      const { data, error } = await supabase.rpc('get_user_role', { _user_id: user.id });
      if (error) {
        console.error('[useUserRole] get_user_role failed:', error);
        return null;
      }
      if (!data) {
        console.warn('[useUserRole] No role row for user', user.id, '— check user_roles table in this environment.');
        return null;
      }
      return data as AppRole;
    },
    enabled: !!user?.id,
    staleTime: 0,
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
