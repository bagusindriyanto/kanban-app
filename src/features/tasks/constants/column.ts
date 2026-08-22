import type { TaskStatus } from '@/types/task';

// Kolom status
export type Column = {
  id: TaskStatus;
  title: 'To Do' | 'On Progress' | 'Done';
};

export const columns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
  },
  {
    id: 'on progress',
    title: 'On Progress',
  },
  {
    id: 'done',
    title: 'Done',
  },
];
