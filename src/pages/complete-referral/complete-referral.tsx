import React, { useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { 
  Lock, 
  Loader2, 
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  useReferrersControllerVerifyTokenMerchant,
  useReferrersControllerVerifyTokenClinic,
  useReferrersControllerCompleteRegistrationMerchant,
  useReferrersControllerCompleteRegistrationClinic
} from "@/services/apis/gen/queries";
import { toast } from "sonner";

export default function CompleteReferralRegistration() {
  const { type } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  
  const role = type === "cli" ? "clinic" : "merchant";

  // Phase 1: Verification
  const verifyMer = useReferrersControllerVerifyTokenMerchant({ token: token! }, {
    query: { enabled: !!token && type === "mer", retry: false }
  });
  const verifyCli = useReferrersControllerVerifyTokenClinic({ token: token! }, {
    query: { enabled: !!token && type === "cli", retry: false }
  });

  const isVerifying = verifyMer.isLoading || verifyCli.isLoading;
  const isInvalid = (type === "mer" && verifyMer.isError) || (type === "cli" && verifyCli.isError);

  // Phase 2: Completion
  const completeMer = useReferrersControllerCompleteRegistrationMerchant();
  const completeCli = useReferrersControllerCompleteRegistrationClinic();

  const isSubmitting = completeMer.isPending || completeCli.isPending;

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      if (type === "mer") {
        await completeMer.mutateAsync({
          data: { token: token!, password }
        });
      } else {
        await completeCli.mutateAsync({
          data: { token: token!, password }
        });
      }
      toast.success("Account created successfully!");
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const errorStr = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to complete registration";
      toast.error(errorStr);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh p-6 text-center gap-4">
        <AlertCircle className="size-16 text-destructive opacity-20" />
        <h2 className="text-2xl font-bold">Invalid Token</h2>
        <p className="text-muted-foreground">No verification token was provided.</p>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh p-6 gap-4">
        <Loader2 className="animate-spin size-12 text-primary" />
        <p className="text-muted-foreground animate-pulse">Verifying your registration link...</p>
      </div>
    );
  }

  if (isInvalid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh p-6 text-center gap-6">
        <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertCircle className="size-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Verification Failed</h2>
          <p className="text-muted-foreground max-w-sm">
            The link is invalid or has expired. Please try registering again to get a new link.
          </p>
        </div>
        <Button asChild className="rounded-xl px-8">
           <Link to="/register-partner">Go Back to Registration</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10 mesh-gradient">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl p-2 shadow-2xl">
          <div className="bg-card/50 backdrop-blur-md rounded-2xl p-6 sm:p-10">
            <form onSubmit={handleComplete} className="flex flex-col gap-8">
              <div className="flex flex-col items-center gap-4">
                <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <ShieldCheck className="size-8" />
                </div>
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-bold tracking-tight">Complete Registration</h1>
                  <p className="text-sm text-muted-foreground">
                    Link verified! Please set a secure password for your <span className="font-bold text-foreground capitalize">{role}</span> account.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="group relative">
                  <Label className="text-xs font-semibold ml-1 mb-1.5 block text-muted-foreground/70 group-focus-within:text-primary transition-colors">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="password" 
                      placeholder="At least 8 characters" 
                      className="h-12 pl-10 rounded-xl bg-white/50 dark:bg-white/5 border-border/50 focus-visible:ring-primary/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="group relative">
                  <Label className="text-xs font-semibold ml-1 mb-1.5 block text-muted-foreground/70 group-focus-within:text-primary transition-colors">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="password" 
                      placeholder="Repeat your password" 
                      className="h-12 pl-10 rounded-xl bg-white/50 dark:bg-white/5 border-border/50 focus-visible:ring-primary/20"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive text-center font-medium bg-destructive/10 p-2 rounded-lg animate-in fade-in zoom-in-95">
                    {error}
                  </p>
                )}

                <Button 
                  type="submit" 
                  className="h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin size-4 mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Finish Registration
                      <ArrowRight className="size-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
