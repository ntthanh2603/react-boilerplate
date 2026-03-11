import { authClient } from "@/utils/auth-client";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

const ProtectedRoute = () => {
  const { useSession } = authClient;
  const { data: session, isPending: isLoadingSession } = useSession();
  const location = useLocation();

  if (isLoadingSession) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm font-medium animate-pulse">Loading session...</p>
      </div>
    );
  }

  if (!session) {
    const currentPath = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(currentPath)}`}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
