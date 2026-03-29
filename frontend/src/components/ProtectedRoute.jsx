import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * ProtectedRoute Component
 * 
 * Renders a component only if the user is authenticated.
 * Redirects to /admin/login if the user is not authenticated.
 * Shows a loading spinner while checking authentication status.
 * 
 * Usage:
 * <ProtectedRoute element={<AdminPanel />} fallback="/admin/login" />
 */
export default function ProtectedRoute({ element, fallback = "/admin/login" }) {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-400 text-sm">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (user === false) {
    return <Navigate to={fallback} replace />;
  }

  // Render the protected component if authenticated
  return element;
}
