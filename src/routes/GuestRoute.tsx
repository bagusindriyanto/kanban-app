import { Navigate, Outlet } from 'react-router';
import useAuthStore from '@/stores/authStore';
import AppLoader from '@/components/shared/AppLoader';

const GuestRoute = () => {
  const { session, isInitialized } = useAuthStore();

  return (
    <AppLoader isLoading={!isInitialized}>
      {session ? <Navigate to="/" replace /> : <Outlet />}
    </AppLoader>
  );
};

export default GuestRoute;
