import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, GalleryVerticalEnd, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { 
  useClinicsControllerVerifyRegistration, 
  useMerchantsControllerVerifyRegistration,
  useClinicsControllerGetRegistrationInfo,
  useMerchantsControllerGetRegistrationInfo
} from "@/services/apis/gen/queries";

export default function ConfirmRegistrationPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get("token") || "";
  const type = searchParams.get("type") || ""; // 'clinic' or 'merchant'

  const { data: clinicInfo, isLoading: isClinicInfoLoading } = useClinicsControllerGetRegistrationInfo(token, {
    query: {
      enabled: !!token && type === "clinic",
    }
  });

  const { data: merchantInfo, isLoading: isMerchantInfoLoading } = useMerchantsControllerGetRegistrationInfo(token, {
    query: {
      enabled: !!token && type === "merchant",
    }
  });

  const registrationInfo = (type === "clinic" ? clinicInfo : merchantInfo) as unknown as { email: string; name: string } | undefined;
  const isInfoLoading = isClinicInfoLoading || isMerchantInfoLoading;

  const { mutateAsync: verifyClinic, isPending: isClinicLoading } = useClinicsControllerVerifyRegistration();
  const { mutateAsync: verifyMerchant, isPending: isMerchantLoading } = useMerchantsControllerVerifyRegistration();

  const isLoading = isClinicLoading || isMerchantLoading;

  useEffect(() => {
    if (!token || !type) {
      toast.error("Invalid registration link.");
      navigate("/login");
    }
  }, [token, type, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");

    try {
      if (type === "clinic") {
        await verifyClinic({
          data: {
            token,
            password,
            email: registrationInfo?.email || "",
          },
        });
      } else if (type === "merchant") {
        await verifyMerchant({
          data: {
            token,
            password,
            email: registrationInfo?.email || "",
          },
        });
      } else {
        throw new Error("Invalid registration type.");
      }

      toast.success("Account confirmed successfully! You can now log in.");
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      setError(
        (err as { response: { data: { message: string } } }).response?.data
          ?.message || "Verification failed or link expired. Please contact admin.",
      );
    }
  };

  if (isInfoLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10 mesh-gradient">
      {/* Background Ornament */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="glass rounded-2xl p-2 shadow-2xl">
          <div className="bg-card/50 backdrop-blur-md rounded-xl p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gradient">Set your password</h1>
              <p className="text-center text-sm text-muted-foreground">
                Complete your registration for {type === 'clinic' ? 'Clinic' : 'Merchant'} account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {registrationInfo && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="size-3.5" /> Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={registrationInfo.email}
                      readOnly
                      disabled
                      className="bg-muted/50 border-primary/10 cursor-not-allowed opacity-80"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="size-3.5" /> Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={registrationInfo.name}
                      readOnly
                      disabled
                      className="bg-muted/50 border-primary/10 cursor-not-allowed opacity-80"
                    />
                  </div>
                </>
              )}

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  className="bg-background/50 border-primary/20 focus-visible:ring-primary focus-visible:border-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  className="bg-background/50 border-primary/20 focus-visible:ring-primary focus-visible:border-primary"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2 text-center animate-in fade-in zoom-in-95">
                  {error}
                </p>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                Confirm Registration
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
