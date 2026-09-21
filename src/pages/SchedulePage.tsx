import { EventCalendarDemo } from '@/components/fullcalendar/event-calendar-demo';
import ErrorBanner from '@/components/shared/ErrorBanner';
import ScheduleCalendar from '@/features/schedules/components/ScheduleCalendar';
import ScheduleControls from '@/features/schedules/components/ScheduleControls';
import { useScheduleCalendar } from '@/features/schedules/hooks/useScheduleCalendar';
import { useScheduleTasks } from '@/features/schedules/hooks/useScheduleTasks';

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

  return (
    <div className="flex flex-col overflow-hidden rounded-md border">
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

      {error && <ErrorBanner errorMessage={error.message} className="m-4" />}

      <ScheduleCalendar
        controller={controller}
        events={events}
        onEventClick={handleEventClick}
        onDatesSet={handleDatesSet}
      />

      <div className="px-5">
        <EventCalendarDemo />
      </div>
    </div>
  );
};

export default SchedulePage;
