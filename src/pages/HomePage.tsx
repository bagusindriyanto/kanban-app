import UpdateTaskModal from '@/features/tasks/components/form/UpdateTaskModal';
import DeleteTaskModal from '@/features/tasks/components/form/DeleteTaskModal';

// Komponen Filter
import TasksControls from '@/features/tasks/components/TasksControls';
import { useFetchTasks } from '@/features/tasks/api/fetchTasks';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useTaskFilters } from '@/features/tasks/hooks/useTaskFilters';

import TasksContents from '@/features/tasks/components/TasksContents';
import OfflineBanner from '@/components/shared/OfflineBanner';
import ErrorBanner from '@/components/shared/ErrorBanner';

const HomePage = () => {
  // Gunakan custom hook untuk logic filter
  const { taskFilters } = useTaskFilters();

  // Tanstack query untuk tasks
  const {
    data: tasks,
    isLoading,
    error,
    dataUpdatedAt,
  } = useFetchTasks({ filters: taskFilters });

  // Cek status online/offline
  const isOnline = useOnlineStatus();

  return (
    <div data-content-padding="false" className="overscroll-none">
      <div className="flex h-[calc(100dvh-var(--dashboard-header-height))] min-h-0 min-w-0 flex-col overflow-hidden">
        {/* Tasks Controls */}
        <div className="flex gap-3 justify-between p-4 shrink-0">
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <TasksControls dataUpdatedAt={dataUpdatedAt} />
        </div>
        {/* Error Banner */}
        {tasks && !isOnline ? (
          <OfflineBanner />
        ) : tasks && error ? (
          <ErrorBanner errorMessage={error.message} className="mb-4" />
        ) : null}
        {/* Tasks Contents */}
        <TasksContents
          isOnline={isOnline}
          isLoading={isLoading}
          error={error}
          tasks={tasks}
        />
        {/* Modal untuk update task */}
        <UpdateTaskModal />
        {/* Modal untuk hapus task */}
        <DeleteTaskModal />
      </div>
    </div>
  );
};

export default HomePage;
