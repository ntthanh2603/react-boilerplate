import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, GalleryVerticalEnd } from "lucide-react";
import { toast } from "sonner";
import { useUsersControllerVerifyOtp, useUsersControllerResendOtp } from "@/services/apis/gen/queries";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";

  const { mutateAsync: verifyOtp, isPending: isLoading } = useUsersControllerVerifyOtp();
  const { mutateAsync: resendOtp, isPending: isResending } = useUsersControllerResendOtp();

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError("Please enter a 6-digit OTP.");
      return;
    }

    setError("");

    try {
      await verifyOtp({
        data: {
          email: email.toLowerCase(),
          otp,
        },
      });
      toast.success("Email verified successfully! You can now log in.");
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      setError(
        (err as { response: { data: { message: string } } }).response?.data
          ?.message || "Invalid OTP. Please try again.",
      );
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await resendOtp({
        data: {
          email: email.toLowerCase(),
        },
      });
      toast.success("OTP resent successfully!");
    } catch (err: unknown) {
      setError(
        (err as { response: { data: { message: string } } }).response?.data
          ?.message || "Failed to resend OTP.",
      );
    }
  };

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
              <h1 className="text-2xl font-bold tracking-tight text-gradient">Verify your email</h1>
              <p className="text-center text-sm text-muted-foreground">
                We've sent a 6-digit code to <br />
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2 text-center">
                <Label htmlFor="otp" className="sr-only">OTP</Label>
                <div className="relative">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    className="h-14 text-center text-3xl tracking-[0.3em] font-mono font-bold bg-background/50 border-primary/20 focus-visible:ring-primary focus-visible:border-primary"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    required
                  />
                  <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-md" />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2 text-center animate-in fade-in zoom-in-95">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                Verify OTP
              </Button>

              <div className="text-center text-sm">
                Didn't receive a code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-medium text-primary hover:underline underline-offset-4 disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
