import ErrorBanner from '@/components/shared/ErrorBanner';
import OfflineBanner from '@/components/shared/OfflineBanner';
import ScheduleCalendar from '@/features/schedules/components/ScheduleCalendar';
import ScheduleControls from '@/features/schedules/components/ScheduleControls';
import ScheduleTaskModal from '@/features/schedules/components/ScheduleTaskModal';
import { useScheduleCalendar } from '@/features/schedules/hooks/useScheduleCalendar';
import { useScheduleTasks } from '@/features/schedules/hooks/useScheduleTasks';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const SchedulePage = () => {
  const { controller, dateInfo, handleDatesSet } = useScheduleCalendar();
  const {
    scope,
    setScope,
    status,
    setStatus,
    events,
    error,
    isLoading,
    dataUpdatedAt,
    taskCount,
    scheduledToday,
    overdue,
    selectedTask,
    handleEventClick,
    handleTaskDialogOpenChange,
  } = useScheduleTasks(dateInfo);
  const isOnline = useOnlineStatus();

  return (
    <div className="flex h-[calc(100dvh-var(--dashboard-header-height)-2rem)] min-h-125 flex-col">
      {!isOnline ? (
        <div className="pb-4">
          <OfflineBanner />
        </div>
      ) : error ? (
        <div className="pb-4">
          <ErrorBanner errorMessage={error.message} />
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border">
        <div className="flex shrink-0 flex-col gap-4 border-b bg-sidebar p-4 text-sidebar-foreground lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 shrink-0 flex-col gap-1">
            <div className="font-medium text-lg leading-none">
              {dateInfo.title}
            </div>
            {isLoading ? (
              <p className="text-muted-foreground text-sm shimmer">
                Memuat jadwal...
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                {dateInfo.days} hari · {taskCount} jadwal · {scheduledToday}{' '}
                hari ini · {overdue} terlewat
              </p>
            )}
          </div>

          <ScheduleControls
            controller={controller}
            viewType={dateInfo.viewType}
            scope={scope}
            status={status}
            onScopeChange={setScope}
            onStatusChange={setStatus}
            dataUpdatedAt={dataUpdatedAt}
          />
        </div>
        <div className="min-h-0 flex-1">
          <ScheduleCalendar
            controller={controller}
            events={events}
            isLoading={isLoading}
            onEventClick={handleEventClick}
            onDatesSet={handleDatesSet}
          />
        </div>
      </div>
      <ScheduleTaskModal
        task={selectedTask}
        open={selectedTask !== null}
        onOpenChange={handleTaskDialogOpenChange}
      />
    </div>
  );
};

export default SchedulePage;
