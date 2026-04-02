import React, { useState } from "react";
import {
  GalleryVerticalEnd,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsersControllerRegister } from "@/services/apis/gen/queries";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();

  const { mutateAsync: register, isPending: isLoading } =
    useUsersControllerRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await register({
        data: {
          email,
          password,
          name,
        },
      });
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`, {
        replace: true,
      });
    } catch (err: unknown) {
      setError(
        (err as { response: { data: { message: string } } }).response?.data
          ?.message || "Something went wrong. Please try again.",
      );
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
                  Create Account
                </span>
              </h1>
              <p className="text-sm text-muted-foreground/80 max-w-[260px] mx-auto">
                Join us and start your journey today
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* Name Field */}
            <div className="group relative">
              <Label
                htmlFor="name"
                className={cn(
                  "text-xs font-semibold ml-1 mb-1.5 block transition-colors",
                  focusedField === "name"
                    ? "text-primary"
                    : "text-muted-foreground/70",
                )}
              >
                Full Name
              </Label>
              <div className="relative">
                <div
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300",
                    focusedField === "name"
                      ? "text-primary scale-110"
                      : "text-muted-foreground/50",
                  )}
                >
                  <User className="h-4 w-4" />
                </div>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className={cn(
                    "h-12 pl-10 pr-4 bg-white/50 dark:bg-white/5 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-300 rounded-xl",
                    focusedField === "name" && "shadow-lg shadow-primary/10",
                  )}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

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
                    focusedField === "email" && "shadow-lg shadow-primary/10",
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
              <Label
                htmlFor="password"
                className={cn(
                  "text-xs font-semibold ml-1 mb-1.5 block transition-colors",
                  focusedField === "password"
                    ? "text-primary"
                    : "text-muted-foreground/70",
                )}
              >
                Password
              </Label>
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
                  placeholder="At least 8 characters"
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
                  minLength={8}
                />
              </div>
            </div>

            {error && (
              <div className="relative overflow-hidden rounded-xl bg-red-50/80 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/50 p-3 animate-in fade-in zoom-in-95">
                <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className={cn(
                "w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80",
                "text-primary-foreground font-semibold text-sm tracking-wide",
                "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
                "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                "rounded-xl group relative overflow-hidden",
              )}
              disabled={isLoading}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground/70">
                Already have an account?{" "}
              </span>
              <Link
                to="/login"
                className="font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 hover:gap-2"
              >
                <span>Sign in</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </form>
      <div className="text-balance text-center text-[11px] text-muted-foreground/50 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary/70 transition-colors">
        By clicking create account, you agree to our{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
