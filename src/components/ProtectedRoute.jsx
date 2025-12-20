import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Handle toast for admin access
  useEffect(() => {
    if (!loading && isAuthenticated && requireAdmin && user?.role !== "admin") {
      toast.error("Admin access only");
    }
  }, [loading, isAuthenticated, requireAdmin, user?.role]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check admin role if required
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
