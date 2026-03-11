import { authClient } from "@/utils/auth-client";
import { getSafeRedirectUrl } from "@/utils/safe-redirect";
import { Navigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { useSession } = authClient;
  const { data: session, isPending: isLoadingSession } = useSession();
  const [searchParams] = useSearchParams();

  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (session) {
    const redirect = getSafeRedirectUrl(searchParams.get("redirect"));
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
