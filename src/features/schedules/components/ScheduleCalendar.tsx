import type {
  CalendarController,
  DatesSetInfo,
  EventClickInfo,
  EventInput,
} from '@fullcalendar/react';
import { CalendarClockIcon, XIcon } from 'lucide-react';
import EventCalendarViews from './EventCalendarViews';
import { plugins, views } from '../constants/calendar';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';

type ScheduleCalendarProps = {
  controller: CalendarController;
  events: EventInput[];
  isLoading: boolean;
  onEventClick: (info: EventClickInfo) => void;
  onDatesSet: (info: DatesSetInfo) => void;
};

const EmptySchedule = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarClockIcon />
        </EmptyMedia>
        <EmptyTitle>Tidak Ada Jadwal</EmptyTitle>
        <EmptyDescription>Tidak ada task terjadwal.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

const ScheduleCalendar = ({
  controller,
  events,
  isLoading,
  onEventClick,
  onDatesSet,
}: ScheduleCalendarProps) => (
  <div className="relative h-full" aria-busy={isLoading}>
    <EventCalendarViews
      height="100%"
      weekNumbers
      weekNumberCalculation="ISO"
      weekTextShort="W"
      controller={controller}
      initialView={views[1].value}
      views={{
        dayGridMonth: {
          dayMaxEvents: 3,
        },
      }}
      eventTimeFormat={{
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }}
      plugins={[...plugins]}
      popoverCloseContent={() => (
        <XIcon className="size-5 text-muted-foreground group-hover:text-foreground" />
      )}
      events={events}
      eventDisplay="block"
      eventClick={onEventClick}
      noEventsContent={<EmptySchedule />}
      nowIndicator
      datesSet={onDatesSet}
    />

    {isLoading && (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-xs">
        <div
          className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium shadow-sm"
          role="status"
          aria-live="polite"
        >
          <Spinner />
          Memuat jadwal...
        </div>
      </div>
    )}
  </div>
);

export default ScheduleCalendar;
