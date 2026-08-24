import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import UpcomingTasksPanel from '@/features/upcoming-tasks/components/UpcomingTasksPanel';
import AppBreadcrumb from './AppBreadcrumb';
import ChatbotDrawer from '@/features/ai/components/ChatbotDrawer';
import { ThemeToggle } from '@/components/motion/theme-toggle';

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-30 bg-background/70 flex px-4 h-12 shrink-0 justify-between items-center gap-2 border-b backdrop-blur-sm">
      <div className="flex gap-2 items-center">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2" />
        <AppBreadcrumb />
      </div>
      <div className="flex gap-2 items-center">
        <ChatbotDrawer />
        <UpcomingTasksPanel />
        <ThemeToggle
          variant="circle-blur"
          start="top-right"
          className="rounded-full border border-border bg-background p-2"
          iconClassName="size-4"
        />
      </div>
    </header>
  );
};

export default AppHeader;
