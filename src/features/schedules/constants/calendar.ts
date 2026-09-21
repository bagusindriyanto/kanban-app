import type { EventInput } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import interactionPlugin from '@fullcalendar/react/interaction';
import listPlugin from '@fullcalendar/react/list';
import multiMonthPlugin from '@fullcalendar/react/multimonth';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import type { ScheduleScope, ScheduleStatus } from '../api/query';
import type { TaskStatus } from '@/types/task';

export const views = [
  { value: 'multiMonthYear', label: 'Tahun' },
  { value: 'dayGridMonth', label: 'Bulan' },
  { value: 'timeGridWeek', label: 'Minggu' },
  { value: 'timeGridDay', label: 'Hari' },
  { value: 'listWeek', label: 'Daftar' },
];

export const scopes: { value: ScheduleScope; label: string }[] = [
  { value: 'all', label: 'Semua task' },
  { value: 'mine', label: 'Task saya' },
  { value: 'assigned', label: 'Ditugaskan oleh saya' },
];

export const statuses: { value: ScheduleStatus; label: string }[] = [
  { value: 'all', label: 'Semua status' },
  { value: 'active', label: 'Aktif' },
  { value: 'todo', label: 'To Do' },
  { value: 'on progress', label: 'On Progress' },
  { value: 'done', label: 'Done' },
];

export const statusColors: Record<
  TaskStatus,
  Pick<EventInput, 'color' | 'contrastColor'>
> = {
  todo: { color: 'var(--chart-1)', contrastColor: 'var(--primary-foreground)' },
  'on progress': {
    color: 'var(--chart-4)',
    contrastColor: 'var(--primary-foreground)',
  },
  done: { color: 'var(--chart-2)', contrastColor: 'var(--primary-foreground)' },
};

export const plugins = [
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  interactionPlugin,
  multiMonthPlugin,
];
