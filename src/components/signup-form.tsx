import React, { useState } from "react";
import { GalleryVerticalEnd, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "@/utils/auth-client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<
    "google" | "facebook" | null
  >(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setIsSocialLoading(provider);
    setError("");
    try {
      const res = await authClient.signIn.social({ provider });
      if (res.error) {
        setError(res.error.message || `Could not sign up with ${provider}.`);
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
      const res = await authClient.signUp.email({ email, password, name });
      if (res.error) {
        setError(res.error.message || "Could not create account.");
      } else {
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`, { replace: true });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <GalleryVerticalEnd className="size-7" />
            </div>
            <div className="space-y-1 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gradient">
                Create Account
              </h1>
              <p className="text-sm text-balance text-muted-foreground">
                Join our community and start your journey today.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-semibold ml-1">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                className="h-11 bg-background/50 border-primary/20 focus-visible:ring-primary focus-visible:border-primary transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-semibold ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                className="h-11 bg-background/50 border-primary/20 focus-visible:ring-primary focus-visible:border-primary transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm font-semibold ml-1">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                className="h-11 bg-background/50 border-primary/20 focus-visible:ring-primary focus-visible:border-primary transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2 text-center animate-in zoom-in-95">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98] font-bold text-base"
              disabled={isLoading || isSocialLoading !== null}
            >
              {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Create Account
            </Button>

            <div className="relative flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold bg-background px-2">
                Or join with
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-11 bg-background/50 border-primary/20 hover:bg-white/5 hover:border-gray-400/40 transition-all"
                type="button"
                disabled={isLoading || isSocialLoading !== null}
                onClick={() => handleSocialLogin("google")}
              >
                {isSocialLoading === "google" ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="mr-2 h-4 w-4"
                  >
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                )}
                Google
              </Button>
              <Button
                variant="outline"
                className="h-11 bg-background/50 border-primary/20 hover:bg-blue-600/5 hover:border-blue-600/40 transition-all"
                type="button"
                disabled={isLoading || isSocialLoading !== null}
                onClick={() => handleSocialLogin("facebook")}
              >
                {isSocialLoading === "facebook" ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="mr-2 h-4 w-4"
                  >
                    <path fill="#3F51B5" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.761,2.239-5,5-5h26c2.762,0,5,2.239,5,5V37z" />
                    <path fill="#FFF" d="M34.368,25H31v13h-5V25h-3v-4h3v-2.41c0-3.088,1.807-4.782,4.459-4.782c1.271,0,2.363,0.094,2.682,0.137v3.11h-1.841c-1.497,0-1.788,0.711-1.788,1.755V21h3.587L34.368,25z" />
                  </svg>
                )}
                Facebook
              </Button>
            </div>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-primary hover:underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </form>
      <div className="text-balance text-center text-[10px] text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary transition-colors">
        By clicking create account, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
