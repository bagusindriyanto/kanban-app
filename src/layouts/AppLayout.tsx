import { Outlet } from 'react-router';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { getCookie } from '@/utils/getCookie';

const defaultOpen = getCookie('sidebar_state') !== 'false'; // default true kalau belum ada cookie

const AppLayout = () => {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="[--dashboard-header-height:--spacing(12)] min-w-0 overflow-x-clip">
        <AppHeader />
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden p-4 has-data-[content-padding=false]:p-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
