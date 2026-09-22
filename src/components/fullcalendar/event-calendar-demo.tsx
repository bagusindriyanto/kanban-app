import { EventCalendar } from '@/components/fullcalendar/event-calendar';

export function EventCalendarDemo() {
  return (
    <EventCalendar
      className="my-10 mx-auto"
      editable
      selectable
      nowIndicator
      navLinks
      timeZone="UTC"
      events="https://fullcalendar.io/api/demo-feeds/events.json"
      addButton={{
        text: 'Add Event',
        click() {
          alert('add event...');
        },
      }}
    />
  );
}
