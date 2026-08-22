import type { TaskStatus, TaskUpdate } from '@/types/task';
import { formatToSQL } from '@/utils/formatTimestamp';
import { columns } from '@/features/tasks/constants/column';
import type { TaskWithProfile } from '@/features/tasks/api/query';

const statusOrder = columns.map((column) => column.id);

export const computeStatusTransition = (
  task: TaskWithProfile,
  newStatus: TaskStatus,
): TaskUpdate | null => {
  if (newStatus === task.status) return null;

  const currentIndex = statusOrder.indexOf(task.status);
  const newIndex = statusOrder.indexOf(newStatus);

  if (currentIndex === -1 || newIndex === -1) return null;

  const now = formatToSQL(new Date());
  let progress = task.timestamp_progress;
  let done = task.timestamp_done;
  let pause = task.pause_time || null;
  let mnt_activity = task.minute_activity || 0;
  let mnt_pause = task.minute_pause || 0;

  const isForward = newIndex > currentIndex;

  if (isForward) {
    for (let i = currentIndex + 1; i <= newIndex; i++) {
      switch (statusOrder[i]) {
        case 'on progress':
          progress = now;
          break;
        case 'done':
          done = now;
          if (progress) {
            const diff = new Date().getTime() - new Date(progress).getTime();
            mnt_activity = Math.floor(diff / 60000) - mnt_pause;
          }
          break;
      }
    }
  } else {
    for (let i = currentIndex - 1; i >= newIndex; i--) {
      switch (statusOrder[i]) {
        case 'todo':
          progress = null;
          pause = null;
          mnt_pause = 0;
          break;
        case 'on progress':
          done = null;
          mnt_activity = 0;
          break;
      }
    }
  }

  return {
    id: task.id,
    user_id: task.user_id,
    assigner_id: task.assigner_id,
    status: newStatus,
    timestamp_progress: progress,
    timestamp_done: done,
    minute_activity: mnt_activity,
    minute_pause: mnt_pause,
    pause_time: pause,
  };
};
