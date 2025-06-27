import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <p>Sprawdzanie autoryzacji...</p>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
};

export default PrivateRoute;