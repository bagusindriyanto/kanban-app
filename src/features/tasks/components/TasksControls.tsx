import { RefreshToggle } from '@/components/shared/RefreshToggle';
import { FilterCalendar } from '@/components/shared/filter/FilterCalendar';
import WorktimeMenu from '@/features/work-time/components/WorktimeMenu';
import FilterUsers from '@/features/users/components/FilterUsers';
import AddTaskModal from './form/AddTaskModal';
import { Button } from '@/components/ui/button';
import { ListFilterIcon } from 'lucide-react';
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
import { useIsMobile } from '@/hooks/useMobile';

const TasksFilters = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer showSwipeHandle>
        <DrawerTrigger render={<Button size="icon" variant="secondary" />}>
          <ListFilterIcon />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter Tasks</DrawerTitle>
            <DrawerDescription>
              Filter berdasarkan PIC atau tanggal tasks yang selesai.
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid grid-cols-2 gap-3 p-4">
            <FilterUsers className="w-full" />
            <FilterCalendar title="Filter Tasks yang Selesai" />
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
    <>
      <FilterUsers />
      <FilterCalendar title="Filter Tasks yang Selesai" />
    </>
  );
};

const TasksControls = ({ dataUpdatedAt }: { dataUpdatedAt: number }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-end items-center min-w-0">
      <WorktimeMenu />
      <RefreshToggle dataUpdatedAt={dataUpdatedAt} />
      <TasksFilters />
      <AddTaskModal />
    </div>
  );
};

export default TasksControls;
