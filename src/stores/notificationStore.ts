import { create } from 'zustand';

type NotificationState = {
  notifiedTaskIds: Set<string>;
  markAsNotified: (notifyId: string) => void;
  upcomingCount: number;
  setUpcomingCount: (count: number) => void;
};

const useNotificationStore = create<NotificationState>()((set) => ({
  notifiedTaskIds: new Set(),
  markAsNotified: (notifyId) =>
    set((state) => ({
      notifiedTaskIds: new Set(state.notifiedTaskIds).add(notifyId),
    })),
  upcomingCount: 0,
  setUpcomingCount: (count) =>
    set((state) =>
      state.upcomingCount === count ? state : { upcomingCount: count },
    ),
}));

export default useNotificationStore;
