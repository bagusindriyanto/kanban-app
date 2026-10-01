import { createBrowserRouter } from 'react-router';

import AppTitle from '@/layouts/AppTitle';
import AuthLayout from '@/layouts/AuthLayout';
import AppLayout from '@/layouts/AppLayout';

import LoginPage from '@/pages/LoginPage';

import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import SchedulePage from '@/pages/SchedulePage';
import SettingsPage from '@/pages/SettingsPage';
import ChangelogPage from '@/pages/ChangelogPage';

import NotFoundPage from '@/pages/NotFoundPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';

import GuestRoute from '@/routes/GuestRoute';
import ProtectedRoute from '@/routes/ProtectedRoute';
// import { lazy, Suspense } from 'react';

// import LoadingPage from './pages/LoadingPage';
// const HomePage = lazy(() => import('./pages/HomePage'));
// const DashboardPage = lazy(() => import('./pages/DashboardPage'));
// const ChangelogPage = lazy(() => import('./pages/ChangelogPage'));
// const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// const Lazy = ({ children }) => (
//   <Suspense fallback={<LoadingPage />}>{children}</Suspense>
// );

export const router = createBrowserRouter([
  {
    element: <AppTitle />,
    children: [
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              {
                path: '/login',
                element: <LoginPage />,
                handle: { breadcrumb: 'Login', title: 'Login | Kanban App' },
              },
              // {
              //   path: '/register',
              //   element: <RegisterPage />,
              //   handle: { breadcrumb: 'Register' },
              // },
            ],
          },
        ],
      },
      {
        element: (
          <ProtectedRoute
          // allowedRoles={['Admin', 'Manager', 'Supervisor', 'Staff']}
          />
        ),
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                index: true,
                element: <HomePage />,
                handle: { breadcrumb: 'Kanban Board' },
              },
              {
                path: 'performance',
                element: <DashboardPage />,
                handle: {
                  breadcrumb: 'Performance',
                  title: 'Performance | Kanban App',
                },
              },
              {
                path: 'schedules',
                element: <SchedulePage />,
                handle: { breadcrumb: 'Jadwal', title: 'Jadwal | Kanban App' },
              },
              {
                path: 'settings',
                element: <SettingsPage />,
                handle: {
                  breadcrumb: 'Pengaturan',
                  title: 'Pengaturan | Kanban App',
                },
              },
              {
                path: 'changelog',
                element: <ChangelogPage />,
                handle: {
                  breadcrumb: 'Changelog',
                  title: 'Changelog | Kanban App',
                },
              },
            ],
          },
        ],
      },
      { path: '/unauthorized', element: <UnauthorizedPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
