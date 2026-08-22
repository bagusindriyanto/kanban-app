import { Spinner } from '@/components/ui/spinner';
import OfflineScreen from '@/components/shared/OfflineScreen';
import ErrorScreen from '@/components/shared/ErrorScreen';
import EmptyScreen from '@/components/shared/EmptyScreen';
import {
  DragDropProvider,
  DragOverlay,
  type DragEndEvent,
} from '@dnd-kit/react';
import { columns } from '../constants/column';
import StatusColumn from './StatusColumn';
import BoardStatsColumn from './BoardStatsColumn';
import TaskCard from './card/TaskCard';
import type { TaskStatus } from '@/types/task';
import { computeStatusTransition } from '../utils/statusTransition';
import { useUpdateTask } from '../api/updateTask';
import { toast } from 'sonner';
import type { TaskWithProfile } from '../api/query';

type TasksContentsProps = {
  isLoading: boolean;
  isOnline: boolean;
  error: Error | null;
  tasks: TaskWithProfile[] | undefined;
};

const TasksContents = ({
  isLoading,
  isOnline,
  error,
  tasks,
}: TasksContentsProps) => {
  const { mutate: updateTaskMutate } = useUpdateTask({
    mutationConfig: {
      onError: (err) => {
        toast.error('Task gagal diperbarui', {
          description: err?.message || null,
        });
      },
    },
  });

  // Handle drag end untuk update status
  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return;

    const { source, target } = event.operation;
    if (!source || !target) return;

    // target.id = column status id (e.g. "todo", "on progress")
    const newStatus = target.id as TaskStatus;
    const task = source.data as TaskWithProfile | undefined;
    if (!task) return;

    const data = computeStatusTransition(task, newStatus);
    if (!data) return;

    updateTaskMutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  if (!isOnline && !tasks) {
    return <OfflineScreen />;
  }

  if (error && !tasks) {
    return <ErrorScreen errorMessage={error.message} />;
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyScreen />;
  }

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden px-4 pb-4 scroll-fade-x">
        <div className="inline-grid h-full min-w-full grid-cols-[repeat(4,minmax(20rem,1fr))] gap-4">
          {columns.map((column) => (
            <StatusColumn
              key={column.id}
              columnId={column.id}
              title={column.title}
              tasks={tasks.filter((task) => task.status === column.id)}
            />
          ))}
          <BoardStatsColumn tasks={tasks} />
        </div>
      </div>
      <DragOverlay>
        {(source) => {
          const task = source?.data as TaskWithProfile | undefined;
          if (!task) return null;
          return (
            <TaskCard task={task} className="opacity-100 scale-105 rotate-1" />
          );
        }}
      </DragOverlay>
    </DragDropProvider>
  );
};

export default TasksContents;
