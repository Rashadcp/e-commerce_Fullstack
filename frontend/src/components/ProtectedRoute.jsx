import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../pages/CartProvider";

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAdmin } = useContext(CartContext);
  const location = useLocation();

  const isAuthenticated = !!user || isAdmin;

  // Handle Login/Register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (user) return <Navigate to="/" replace />;
    return children; // Allow unauthenticated users to see login/register
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin routing logic
  if (requireAdmin) {
    if (!isAdmin) {
      // If user is logged in but not admin, redirect to home
      return <Navigate to="/" replace />;
    }
    return children;
  }

  // If it's a normal route but user is admin, allow access or handle as needed
  // For now, let admins access regular pages (like products) if they want, 
  // but usually admins go to /admin.

  return children;
}

export default ProtectedRoute;
