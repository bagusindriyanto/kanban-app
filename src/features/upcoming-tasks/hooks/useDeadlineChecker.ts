import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useNotificationStore from '@/stores/notificationStore';
import type { UpcomingTask } from '../api/query';
import { REMINDER_GRACE_MS, UPCOMING_WINDOW_MINUTES } from '../constants';
import { playReminderSound, unlockReminderSound } from '../lib/reminderSound';

export const useDeadlineChecker = (tasks: UpcomingTask[]) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const unlockSound = () => {
      unlockReminderSound();
      document.removeEventListener('pointerdown', unlockSound);
      document.removeEventListener('keydown', unlockSound);
    };

    document.addEventListener('pointerdown', unlockSound);
    document.addEventListener('keydown', unlockSound);

    return () => {
      document.removeEventListener('pointerdown', unlockSound);
      document.removeEventListener('keydown', unlockSound);
    };
  }, []);

  useEffect(() => {
    const checkDeadlines = () => {
      const currentTime = Date.now();
      const { notifiedTaskIds, markAsNotified } =
        useNotificationStore.getState();
      let hasStartedTask = false;

      tasks.forEach((task) => {
        if (!task.scheduled_at) return;

        const scheduledTime = new Date(task.scheduled_at).getTime();
        const diffInMinutes = Math.ceil((scheduledTime - currentTime) / 60000);

        if (scheduledTime <= currentTime) {
          const notifyId = `${task.id}-${task.scheduled_at}-start`;
          if (
            currentTime - scheduledTime <= REMINDER_GRACE_MS &&
            !notifiedTaskIds.has(notifyId)
          ) {
            toast.info(task.content, {
              position: 'bottom-center',
              description: 'Jadwal task sudah dimulai.',
              duration: 10000,
              closeButton: true,
            });
            markAsNotified(notifyId);
            hasStartedTask = true;
          }
          return;
        }

        if (diffInMinutes > 15 && diffInMinutes <= UPCOMING_WINDOW_MINUTES) {
          const notifyId = `${task.id}-${task.scheduled_at}-30`;
          if (!notifiedTaskIds.has(notifyId)) {
            toast.info(task.content, {
              position: 'bottom-center',
              description: `Task akan dimulai dalam ${diffInMinutes} menit.`,
              duration: 10000,
              closeButton: true,
            });
            markAsNotified(notifyId);
          }
        } else if (diffInMinutes > 0 && diffInMinutes <= 15) {
          const notifyId = `${task.id}-${task.scheduled_at}-15`;
          if (!notifiedTaskIds.has(notifyId)) {
            toast.info(task.content, {
              position: 'bottom-center',
              description: `Task "${task.content}" harus segera dimulai dalam ${diffInMinutes} menit.`,
              duration: 10000,
              closeButton: true,
            });
            markAsNotified(notifyId);
          }
        }
      });

      if (hasStartedTask) playReminderSound();
    };

    const interval = setInterval(() => {
      setNow(Date.now());
      checkDeadlines();
    }, 1000);
    checkDeadlines();

    return () => clearInterval(interval);
  }, [tasks]);

  return now;
};
