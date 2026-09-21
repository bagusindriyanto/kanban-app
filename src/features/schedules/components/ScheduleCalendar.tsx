import type {
  CalendarController,
  DatesSetInfo,
  EventClickInfo,
  EventInput,
} from '@fullcalendar/react';
import { XIcon } from 'lucide-react';
import EventCalendarViews from './EventCalendarViews';
import { plugins, views } from '../constants/calendar';

type ScheduleCalendarProps = {
  controller: CalendarController;
  events: EventInput[];
  onEventClick: (info: EventClickInfo) => void;
  onDatesSet: (info: DatesSetInfo) => void;
};

const ScheduleCalendar = ({
  controller,
  events,
  onEventClick,
  onDatesSet,
}: ScheduleCalendarProps) => (
  <EventCalendarViews
    controller={controller}
    initialView={views[0].value}
    plugins={[...plugins]}
    popoverCloseContent={() => (
      <XIcon className="size-5 text-muted-foreground group-hover:text-foreground" />
    )}
    events={events}
    eventClick={onEventClick}
    noEventsContent="Tidak ada task terjadwal."
    nowIndicator
    datesSet={onDatesSet}
  />
);

export default ScheduleCalendar;
