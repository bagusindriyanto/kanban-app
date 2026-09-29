import { useEffect } from 'react';
import { Outlet, useMatches } from 'react-router';
import { setFaviconBadge } from '@/features/upcoming-tasks/lib/faviconBadge';
import useNotificationStore from '@/stores/notificationStore';

type RouteHandle = {
  title?: string;
};

const AppTitle = () => {
  const matches = useMatches();
  const upcomingCount = useNotificationStore((state) => state.upcomingCount);

  useEffect(() => {
    const currentRoute = [...matches]
      .reverse()
      .find((match) => (match.handle as RouteHandle)?.title);

    const title = (currentRoute?.handle as RouteHandle)?.title ?? 'Kanban App';
    document.title = upcomingCount > 0 ? `(${upcomingCount}) ${title}` : title;
  }, [matches, upcomingCount]);

  useEffect(() => setFaviconBadge(upcomingCount), [upcomingCount]);

  return <Outlet />;
};

export default AppTitle;
