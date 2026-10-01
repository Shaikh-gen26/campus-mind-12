import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps a role-specific route tree. If the logged-in user's role isn't in
 * `roles`, they're redirected — never shown the page, matching the "Access
 * Denied, redirected away" behavior specified for every cross-role example
 * in the README (student hitting /admin/dashboard, etc).
 */
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }
  return children;
}
