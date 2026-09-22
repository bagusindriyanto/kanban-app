import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import AddTaskForm from './AddTaskForm';
import { PlusIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMobile';

type AddTaskModalProps = {
  defaultScheduled?: boolean;
};

const AddTaskModal = ({ defaultScheduled = false }: AddTaskModalProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
        <DrawerTrigger render={<Button size="icon" />}>
          <PlusIcon />
        </DrawerTrigger>
        <DrawerContent className="max-h-[calc(100dvh-1rem)]">
          <DrawerHeader>
            <DrawerTitle>
              {defaultScheduled ? 'Jadwalkan Task' : 'Tambah Task'}
            </DrawerTitle>
            <DrawerDescription>
              {defaultScheduled ? 'Buat task terjadwal.' : 'Buat task baru.'}
            </DrawerDescription>
          </DrawerHeader>
          <AddTaskForm
            isMobile={isMobile}
            onOpenChange={setOpen}
            defaultScheduled={defaultScheduled}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        {defaultScheduled ? 'Jadwalkan Task' : 'Tambah Task'}
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100dvh-4rem)] flex-col">
        <DialogHeader>
          <DialogTitle>
            {defaultScheduled ? 'Jadwalkan Task' : 'Tambah Task'}
          </DialogTitle>
          <DialogDescription>
            {defaultScheduled ? 'Buat task terjadwal.' : 'Buat task baru.'}
          </DialogDescription>
        </DialogHeader>
        <AddTaskForm
          isMobile={isMobile}
          onOpenChange={setOpen}
          defaultScheduled={defaultScheduled}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;
