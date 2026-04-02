import React, { useState } from "react";
import {
  GalleryVerticalEnd,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { authClient } from "@/utils/auth-client";
import { getSafeRedirectUrl } from "@/utils/safe-redirect";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<
    "google" | "apple" | null
  >(null);
  const [error, setError] = useState("");
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setIsSocialLoading(provider);
    setError("");
    try {
      const res = await authClient.signIn.social({
        provider,
        callbackURL: window.location.origin,
      });
      if (res.error) {
        if (
          res.error.status === 403 &&
          res.error.message?.includes("two_factor")
        ) {
          setTwoFactorStep(true);
        } else {
          setError(res.error.message || `Could not sign in with ${provider}.`);
        }
      }
    } catch {
      setError(`Something went wrong linking with ${provider}.`);
    } finally {
      setIsSocialLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (twoFactorStep) {
        const res = await authClient.twoFactor.verifyOtp({
          code: otp,
        });
        if (res.error) {
          setError(res.error.message || "Invalid 2FA code.");
          return;
        }
        const params = new URLSearchParams(window.location.search);
        navigate(getSafeRedirectUrl(params.get("redirect")), { replace: true });
        return;
      }

      const res = await authClient.signIn.email({ email, password });
      if (res.error) {
        if (
          res.error.status === 403 &&
          res.error.message?.includes("two_factor")
        ) {
          setTwoFactorStep(true);
        } else {
          setError(res.error.message || "Invalid email or password.");
        }
      } else {
        const params = new URLSearchParams(window.location.search);
        const redirect = getSafeRedirectUrl(params.get("redirect"));
        window.location.href = redirect;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        onSubmit={handleSubmit}
        className="animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 blur-xl rounded-full" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-xl border border-primary/10">
                <GalleryVerticalEnd className="size-8" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-4xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Welcome Back
                </span>
              </h1>
              <p className="text-sm text-muted-foreground/80 max-w-[260px] mx-auto">
                Sign in to continue your journey with us
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {!twoFactorStep ? (
              <>
                {/* Email Field */}
                <div className="group relative">
                  <Label
                    htmlFor="email"
                    className={cn(
                      "text-xs font-semibold ml-1 mb-1.5 block transition-colors",
                      focusedField === "email"
                        ? "text-primary"
                        : "text-muted-foreground/70",
                    )}
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <div
                      className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300",
                        focusedField === "email"
                          ? "text-primary scale-110"
                          : "text-muted-foreground/50",
                      )}
                    >
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className={cn(
                        "h-12 pl-10 pr-4 bg-white/50 dark:bg-white/5 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-300 rounded-xl",
                        focusedField === "email" &&
                          "shadow-lg shadow-primary/10",
                      )}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="group relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <Label
                      htmlFor="password"
                      className={cn(
                        "text-xs font-semibold ml-1 transition-colors",
                        focusedField === "password"
                          ? "text-primary"
                          : "text-muted-foreground/70",
                      )}
                    >
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-primary/80 hover:text-primary transition-colors hover:underline underline-offset-2"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div
                      className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300",
                        focusedField === "password"
                          ? "text-primary scale-110"
                          : "text-muted-foreground/50",
                      )}
                    >
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className={cn(
                        "h-12 pl-10 pr-4 bg-white/50 dark:bg-white/5 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-300 rounded-xl",
                        focusedField === "password" &&
                          "shadow-lg shadow-primary/10",
                      )}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Two Factor Step */
              <div className="grid gap-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-2 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <Label htmlFor="otp" className="text-lg font-bold">
                    2FA Verification
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  className="h-14 text-center text-2xl tracking-[0.5em] font-mono font-bold bg-white/50 dark:bg-white/5 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/30 rounded-xl"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  required
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setTwoFactorStep(false)}
                >
                  ← Back to login
                </Button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="relative overflow-hidden rounded-xl bg-red-50/80 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/50 p-3 animate-in fade-in zoom-in-95">
                <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className={cn(
                "w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80",
                "text-primary-foreground font-semibold text-sm tracking-wide",
                "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
                "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                "rounded-xl group relative overflow-hidden",
              )}
              disabled={isLoading || isSocialLoading !== null}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>{twoFactorStep ? "Verify & Login" : "Sign In"}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Button>

            {!twoFactorStep && (
              <>
                {/* Divider */}
                <div className="relative flex items-center gap-4 py-1">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium bg-background/50 px-3">
                    Or continue with
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className={cn(
                      "h-12 bg-white/30 dark:bg-white/5 border-border/50 hover:bg-white/50 dark:hover:bg-white/10",
                      "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                      "transition-all duration-300 rounded-xl font-medium text-sm",
                    )}
                    type="button"
                    disabled={isLoading || isSocialLoading !== null}
                    onClick={() => handleSocialLogin("google")}
                  >
                    {isSocialLoading === "google" ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          className="h-4 w-4"
                        >
                          <path
                            fill="#FFC107"
                            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                          />
                          <path
                            fill="#FF3D00"
                            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                          />
                          <path
                            fill="#4CAF50"
                            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                          />
                          <path
                            fill="#1976D2"
                            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                          />
                        </svg>
                        <span>Google</span>
                      </div>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-12 bg-white/30 dark:bg-white/5 border-border/50 hover:bg-white/50 dark:hover:bg-white/10",
                      "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                      "transition-all duration-300 rounded-xl font-medium text-sm",
                    )}
                    type="button"
                    disabled={isLoading || isSocialLoading !== null}
                    onClick={() => handleSocialLogin("apple")}
                  >
                    {isSocialLoading === "apple" ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 384 512"
                          className="h-4 w-4"
                        >
                          <path
                            fill="currentColor"
                            d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
                          />
                        </svg>
                        <span>Apple</span>
                      </div>
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Sign Up Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground/70">
                Don't have an account?{" "}
              </span>
              <Link
                to="/register"
                className="font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 hover:gap-2"
              >
                <span>Sign up</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </form>

      {/* Footer Terms */}
      <div className="text-balance text-center text-[11px] text-muted-foreground/50 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary/70 transition-colors">
        By continuing, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
