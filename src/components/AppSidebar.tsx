import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  IndianRupee,
  UserCog,
  Megaphone,
  LogOut,
  GraduationCap,
  UserRound,
  School,
  BookOpen,
  CalendarDays,
  BarChart3,
  Settings,
  Shield,
  Wallet,
  ClipboardList,
  Lightbulb,
  Receipt,
  UserPlus,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/hooks/useLanguage';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

type MenuItem = { title: string; url: string; icon: any; minRole?: 'admin' | 'manager' };

const roleLabels: Record<string, string> = { admin: 'Admin', manager: 'Manager', viewer: 'Viewer' };

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { role, isAdmin, isManager } = useUserRole();
  const { t } = useLanguage();

  const mainMenu: MenuItem[] = [
    { title: t('nav.dashboard'), url: '/', icon: LayoutDashboard },
    { title: t('nav.students'), url: '/students', icon: Users },
    { title: t('nav.parents'), url: '/parents', icon: UserRound },
    
    { title: t('nav.attendance'), url: '/attendance', icon: CalendarCheck },
    { title: t('nav.fees'), url: '/fees', icon: IndianRupee },
    { title: t('nav.teachers'), url: '/teachers', icon: UserCog, minRole: 'admin' },
    { title: t('nav.staffSalary'), url: '/staff-salary', icon: Wallet, minRole: 'admin' },
    { title: t('nav.teacherSummary'), url: '/teacher-summary', icon: ClipboardList, minRole: 'admin' },
    { title: t('nav.expenses'), url: '/expenses', icon: Receipt, minRole: 'admin' },
    { title: t('nav.inquiries'), url: '/inquiries', icon: UserPlus },
  ];

  const moreMenu: MenuItem[] = [
    { title: t('nav.homework'), url: '/homework', icon: BookOpen },
    { title: t('nav.activityIdeas'), url: '/activity-ideas', icon: Lightbulb },
    { title: t('nav.examResults'), url: '/exam-results', icon: GraduationCap },
    { title: t('nav.events'), url: '/events', icon: CalendarDays },
    { title: t('nav.announcements'), url: '/announcements', icon: Megaphone },
    { title: t('nav.reports'), url: '/reports', icon: BarChart3, minRole: 'manager' },
    { title: t('nav.settings'), url: '/settings', icon: Settings, minRole: 'admin' },
  ];

  const canAccess = (item: MenuItem) => {
    if (!item.minRole) return true;
    if (item.minRole === 'admin') return isAdmin;
    if (item.minRole === 'manager') return isManager;
    return true;
  };

  const renderMenu = (items: MenuItem[]) => (
    <SidebarMenu>
      {items.filter(canAccess).map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton
            asChild
            isActive={item.url === '/' ? location.pathname === '/' : location.pathname === item.url}
          >
            <NavLink
              to={item.url}
              end={item.url === '/'}
              className="hover:bg-sidebar-accent/50"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 flex items-center gap-3">
          <img src="/images/school-logo.png" alt="SSVEMS Logo" className="w-10 h-10 rounded-xl flex-shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-sidebar-foreground leading-tight truncate">
                Saraswati Vidya
              </h2>
              <p className="text-xs text-sidebar-foreground/70 truncate">{t('nav.schoolAdmin')}</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.main')}</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenu(mainMenu)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.more')}</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenu(moreMenu)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {!collapsed && (
            <SidebarMenuItem>
              <div className="px-3 py-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                {role ? (
                  <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0 ml-auto">
                    {roleLabels[role] ?? role}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto">…</Badge>
                )}
              </div>
            </SidebarMenuItem>
          )}
          {collapsed && role && (
            <SidebarMenuItem>
              <div className="px-2 py-1 flex justify-center">
                <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="text-[9px] px-1 py-0">
                  {(roleLabels[role] ?? role).slice(0, 3)}
                </Badge>
              </div>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>{t('nav.signOut')}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
