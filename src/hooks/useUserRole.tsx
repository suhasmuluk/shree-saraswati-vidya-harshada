import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'manager' | 'viewer';

const isAppRole = (role: unknown): role is AppRole =>
  role === 'admin' || role === 'manager' || role === 'viewer';

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: role, isLoading } = useQuery({
    queryKey: ['user-role', user?.id, user?.email],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      if (error) {
        console.error('[useUserRole] user_roles fetch failed:', error);
        return null;
      }
      const roles = (data ?? []).map((row) => row.role).filter(isAppRole);
      const resolvedRole = roles.includes('admin') ? 'admin' : roles.includes('manager') ? 'manager' : roles.includes('viewer') ? 'viewer' : null;
      if (!resolvedRole) {
        console.warn('[useUserRole] No valid role row for user', user.id, '— check public.user_roles in this environment.');
        return null;
      }
      return resolvedRole;
    },
    enabled: !authLoading && !!user?.id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  return {
    role: role ?? null,
    isLoading: authLoading || isLoading,
    isAdmin: role === 'admin',
    isManager: role === 'manager' || role === 'admin',
    isViewer: role === 'viewer',
    canEdit: role === 'admin' || role === 'manager',
    canDelete: role === 'admin',
  };
};
