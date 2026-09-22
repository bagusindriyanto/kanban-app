import type { EventInput } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import interactionPlugin from '@fullcalendar/react/interaction';
import listPlugin from '@fullcalendar/react/list';
import multiMonthPlugin from '@fullcalendar/react/multimonth';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import type { ScheduleScope, ScheduleStatus } from '../api/query';
import type { TaskStatus } from '@/types/task';
import {
  Columns2Icon,
  Grid2x2Icon,
  Grid3x3Icon,
  ListIcon,
  Rows3Icon,
  type LucideIcon,
} from 'lucide-react';

export type View =
  | 'multiMonthYear'
  | 'dayGridMonth'
  | 'timeGridWeek'
  | 'timeGridDay'
  | 'listWeek';

export const views = [
  { value: 'multiMonthYear', icon: Grid2x2Icon, label: 'Tahun' },
  { value: 'dayGridMonth', icon: Grid3x3Icon, label: 'Bulan' },
  { value: 'timeGridWeek', icon: Columns2Icon, label: 'Minggu' },
  { value: 'timeGridDay', icon: Rows3Icon, label: 'Hari' },
  { value: 'listWeek', icon: ListIcon, label: 'Daftar' },
] as const satisfies {
  value: View;
  icon: LucideIcon;
  label: string;
}[];

export const scopes = [
  { value: 'all', label: 'Semua task' },
  { value: 'mine', label: 'Task saya' },
  { value: 'assigned', label: 'Ditugaskan oleh saya' },
] as const satisfies { value: ScheduleScope; label: string }[];

export const statuses = [
  { value: 'all', label: 'Semua status' },
  { value: 'active', label: 'Aktif' },
  { value: 'todo', label: 'To Do' },
  { value: 'on progress', label: 'On Progress' },
  { value: 'done', label: 'Done' },
] as const satisfies { value: ScheduleStatus; label: string }[];

export const statusColors: Record<
  TaskStatus,
  Pick<EventInput, 'color' | 'contrastColor'>
> = {
  todo: {
    color: 'var(--todo)',
    contrastColor: 'var(--todo-foreground)',
  },
  'on progress': {
    color: 'var(--progress)',
    contrastColor: 'var(--progress-foreground)',
  },
  done: {
    color: 'var(--done)',
    contrastColor: 'var(--done-foreground)',
  },
};

export const plugins = [
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  interactionPlugin,
  multiMonthPlugin,
];
