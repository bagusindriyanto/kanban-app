import { BellRingIcon, CalendarClockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UPCOMING_WINDOW_MINUTES } from '../constants';
import { useUpcomingTasks } from '../hooks/useUpcomingTasks';
import UpcomingTaskCard from './UpcomingTaskCard';

const UpcomingTasksPanel = () => {
  const visibleTasks = useUpcomingTasks();

  return (
    <Sheet>
      <Tooltip>
        <TooltipTrigger
          render={
            <SheetTrigger
              nativeButton={false}
              render={<div className="relative w-fit" />}
            />
          }
        >
          <Button variant="outline" size="icon">
            <BellRingIcon />
          </Button>
          {visibleTasks.length > 0 && (
            <Badge className="absolute -top-1 -right-1 size-4 tabular-nums p-0 bg-red-300 text-red-700 dark:bg-red-700 dark:text-red-300">
              {visibleTasks.length > 9 ? '9+' : visibleTasks.length}
            </Badge>
          )}
        </TooltipTrigger>
        <TooltipContent>Task yang Akan Dimulai</TooltipContent>
      </Tooltip>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Task yang Akan Dimulai</SheetTitle>
          <SheetDescription>
            Menampilkan task yang akan dimulai dalam {UPCOMING_WINDOW_MINUTES}{' '}
            menit ke depan.
          </SheetDescription>
        </SheetHeader>
        {visibleTasks.length > 0 ? (
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 space-y-6 pb-4">
              {visibleTasks.map((task) => (
                <UpcomingTaskCard key={task.id} task={task} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarClockIcon />
              </EmptyMedia>
              <EmptyTitle>Tidak Ada Task</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default UpcomingTasksPanel;
