import { useEffect } from 'react';
import { Outlet, useMatches } from 'react-router';

type RouteHandle = {
  title?: string;
};

const AppTitle = () => {
  const matches = useMatches();

  useEffect(() => {
    const currentRoute = [...matches]
      .reverse()
      .find((match) => (match.handle as RouteHandle)?.title);

    document.title =
      (currentRoute?.handle as RouteHandle)?.title ?? 'Kanban App';
  }, [matches]);

  return <Outlet />;
};

export default AppTitle;
