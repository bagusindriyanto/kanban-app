import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import UpdateTaskForm from './UpdateTaskForm';
import useModalStore from '@/stores/modalStore';
import { useIsMobile } from '@/hooks/useMobile';

const UpdateTaskModal = () => {
  const isMobile = useIsMobile();
  const isUpdateOpen = useModalStore((state) => state.isUpdateOpen);
  const selectedTask = useModalStore((state) => state.selectedTask);
  const setUpdateOpen = useModalStore((state) => state.setUpdateOpen);
  const handleOpenChange = (open: boolean) => setUpdateOpen(open, selectedTask);

  if (isMobile) {
    return (
      <Drawer
        open={isUpdateOpen}
        onOpenChange={handleOpenChange}
        showSwipeHandle
      >
        <DrawerContent className="max-h-[calc(100dvh-1rem)]">
          <DrawerHeader>
            <DrawerTitle>Edit Task</DrawerTitle>
            <DrawerDescription>
              Perbarui informasi task yang dipilih.
            </DrawerDescription>
          </DrawerHeader>
          <UpdateTaskForm
            isMobile={isMobile}
            onCancel={() => handleOpenChange(false)}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isUpdateOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-4rem)] flex-col">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Perbarui informasi task yang dipilih.
          </DialogDescription>
        </DialogHeader>
        <UpdateTaskForm
          isMobile={isMobile}
          onCancel={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTaskModal;
