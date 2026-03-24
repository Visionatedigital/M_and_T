import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

/**
 * Route guard: only users with role `admin` may view children.
 * Loan officers are redirected to the main staff dashboard.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground text-sm">
        Checking access…
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/staff-dashboard" replace />;
  }

  return <>{children}</>;
}
