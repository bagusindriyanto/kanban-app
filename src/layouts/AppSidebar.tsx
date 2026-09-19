import { Link, useLocation } from 'react-router';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import UserMenu from '@/features/auth/components/UserMenu';
import logo from '@/assets/logo.png';
import {
  SquareKanbanIcon,
  ChartNoAxesCombinedIcon,
  HelpCircleIcon,
  UserIcon,
  CalendarIcon,
} from 'lucide-react';

const navMain = [
  { to: '/', label: 'Kanban Board', icon: SquareKanbanIcon },
  { to: '/performance', label: 'Performance', icon: ChartNoAxesCombinedIcon },
  { to: '/schedules', label: 'Jadwal', icon: CalendarIcon },
];

const navSecondary = [
  { to: '/settings', label: 'Akun', icon: UserIcon },
  { to: '/changelog', label: 'Changelog', icon: HelpCircleIcon },
];

const AppSidebar = () => {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 transition-[padding] group-data-[state=expanded]:px-2 group-data-[state=expanded]:py-1">
              <img src={logo} alt="Kanban App" className="size-7 m-0.5" />
              <span className="text-lg font-semibold tracking-tight truncate font-heading">
                Kanban App
              </span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={
                      item.to === '/'
                        ? pathname === '/'
                        : pathname.startsWith(item.to)
                    }
                    render={<Link to={item.to} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Pengaturan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={
                      item.to === '/'
                        ? pathname === '/'
                        : pathname.startsWith(item.to)
                    }
                    render={<Link to={item.to} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
