import { Navigate } from 'react-router-dom';

function ProtectedAdminRoute({ children }) {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;