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

type ScheduleCalendarProps = {
  controller: CalendarController;
  events: EventInput[];
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
  onEventClick,
  onDatesSet,
}: ScheduleCalendarProps) => (
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
);

export default ScheduleCalendar;
