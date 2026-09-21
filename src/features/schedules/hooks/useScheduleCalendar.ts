import { useState } from 'react';
import { useCalendarController, type DatesSetInfo } from '@fullcalendar/react';
import {
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  startOfMonth,
} from 'date-fns';
import { views } from '../constants/calendar';

export const useScheduleCalendar = () => {
  const controller = useCalendarController();
  const [dateInfo, setDateInfo] = useState(() => {
    const now = new Date();
    const start = startOfMonth(now);

    return {
      viewType: views[0].value,
      title: format(now, 'MMMM yyyy'),
      days: differenceInCalendarDays(endOfMonth(now), startOfMonth(now)) + 1,
      start: start.toISOString(),
      end: addMonths(start, 1).toISOString(),
    };
  });

  const handleDatesSet = (info: DatesSetInfo) => {
    setDateInfo({
      viewType: info.view.type,
      title: info.view.title,
      days: differenceInCalendarDays(
        info.view.currentEnd,
        info.view.currentStart,
      ),
      start: info.start.toISOString(),
      end: info.end.toISOString(),
    });
  };

  return { controller, dateInfo, handleDatesSet };
};
