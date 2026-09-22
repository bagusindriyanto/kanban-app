import idLocale from '@fullcalendar/react/locales/id';
import {
  EventCalendarViews as BaseEventCalendarViews,
  type EventCalendarViewProps,
} from '@/components/fullcalendar/event-calendar-views';

const EventCalendarViews = (props: EventCalendarViewProps) => (
  <BaseEventCalendarViews {...props} locale={idLocale} />
);

export default EventCalendarViews;
