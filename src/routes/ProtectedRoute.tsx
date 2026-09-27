import { Navigate, Outlet } from 'react-router';
import useAuthStore from '@/stores/authStore';
import AppLoader from '@/components/shared/AppLoader';

const ProtectedRoute = () => {
  const { session, isInitialized } = useAuthStore();

  return (
    <AppLoader isLoading={!isInitialized}>
      {session ? <Outlet /> : <Navigate to="/login" replace />}
    </AppLoader>
  );
};

export default ProtectedRoute;
