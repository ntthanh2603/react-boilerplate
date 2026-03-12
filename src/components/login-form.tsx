import { useState } from "react";
import { GalleryVerticalEnd } from "lucide-react";
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
  const [isSocialLoading, setIsSocialLoading] = useState<"google" | "facebook" | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setIsSocialLoading(provider);
    setError("");
    try {
      const res = await authClient.signIn.social({ provider });
      if (res.error) {
        setError(res.error.message || `Could not sign in with ${provider}.`);
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
      const res = await authClient.signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message || "Invalid email or password.");
      } else {
        const params = new URLSearchParams(window.location.search);
        navigate(getSafeRedirectUrl(params.get("redirect")), { replace: true });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">React Base</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to React Base</h1>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs underline underline-offset-4 text-muted-foreground hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || isSocialLoading !== null}>
              {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Login
            </Button>
            
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                disabled={isLoading || isSocialLoading !== null}
                onClick={() => handleSocialLogin("google")}
              >
                {isSocialLoading === "google" ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                )}
                Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                type="button"
                disabled={isLoading || isSocialLoading !== null}
                onClick={() => handleSocialLogin("facebook")}
              >
                {isSocialLoading === "facebook" ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                    <path
                      d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-1.125 0-2.072.162-2.548.81-.476.649-.691 1.637-.691 3.167v2.003h3.585l-.337 3.667h-3.248v7.98h-3.842z"
                      fill="currentColor"
                    />
                  </svg>
                )}
                Facebook
              </Button>
            </div>
          </div>
        </div>
      </form>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
