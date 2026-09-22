import ErrorBanner from '@/components/shared/ErrorBanner';
import OfflineBanner from '@/components/shared/OfflineBanner';
import ScheduleCalendar from '@/features/schedules/components/ScheduleCalendar';
import ScheduleControls from '@/features/schedules/components/ScheduleControls';
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
    taskCount,
    scheduledToday,
    overdue,
    handleEventClick,
  } = useScheduleTasks(dateInfo);
  const isOnline = useOnlineStatus();

  return (
    <>
      {!isOnline ? (
        <div className="pb-4">
          <OfflineBanner />
        </div>
      ) : error ? (
        <div className="pb-4">
          <ErrorBanner errorMessage={error.message} />
        </div>
      ) : null}
      <div className="flex flex-col overflow-hidden rounded-2xl border">
        <div className="flex flex-col gap-4 border-b bg-sidebar p-4 text-sidebar-foreground lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 shrink-0 flex-col gap-1">
            <div className="font-medium text-lg leading-none">
              {dateInfo.title}
            </div>
            <p className="text-muted-foreground text-sm">
              {dateInfo.days} hari · {taskCount} jadwal · {scheduledToday} hari
              ini · {overdue} terlewat
            </p>
          </div>

          <ScheduleControls
            controller={controller}
            viewType={dateInfo.viewType}
            scope={scope}
            status={status}
            onScopeChange={setScope}
            onStatusChange={setStatus}
          />
        </div>

        <ScheduleCalendar
          controller={controller}
          events={events}
          onEventClick={handleEventClick}
          onDatesSet={handleDatesSet}
        />
      </div>
    </>
  );
};

export default SchedulePage;
