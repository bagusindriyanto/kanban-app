import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ClockIcon } from 'lucide-react';
import WorktimeInput from './WorktimeInput';
import { useIsMobile } from '@/hooks/useMobile';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useFetchWorkTime } from '../api/fetchWorkTime';

const WorktimeMenu = () => {
  const isMobile = useIsMobile();
  const { data: workTime, isLoading } = useFetchWorkTime();

  if (isMobile) {
    return (
      <Drawer showSwipeHandle>
        <Tooltip>
          <TooltipTrigger
            render={
              <DrawerTrigger
                nativeButton={false}
                render={<div className="relative w-fit" />}
              />
            }
          >
            <Button variant="secondary" size="icon-sm">
              <ClockIcon />
              {!isLoading && (!workTime || workTime.working_minute === 0) && (
                <span className="bg-red-300 dark:bg-red-700 size-2 absolute -top-0.5 -right-0.5 rounded-full animate-pulse" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Jam Kerja</TooltipContent>
        </Tooltip>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Jam Kerja</DrawerTitle>
            <DrawerDescription>Masukkan jam kerja hari ini.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <WorktimeInput workTime={workTime} isLoading={isLoading} />
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button variant="outline" />}>
              Tutup
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              nativeButton={false}
              render={<div className="relative w-fit" />}
            />
          }
        >
          <Button variant="secondary" size="icon-sm">
            <ClockIcon />
            {!isLoading && (!workTime || workTime.working_minute === 0) && (
              <span className="bg-red-300 dark:bg-red-700 size-3 absolute -top-0.5 -right-0.5 rounded-full animate-pulse" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Jam Kerja</TooltipContent>
      </Tooltip>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Jam Kerja</PopoverTitle>
          <PopoverDescription>Masukkan jam kerja hari ini.</PopoverDescription>
        </PopoverHeader>
        <WorktimeInput workTime={workTime} isLoading={isLoading} />
      </PopoverContent>
    </Popover>
  );
};

export default WorktimeMenu;
