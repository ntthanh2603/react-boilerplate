import { useState } from "react";
import { Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  useRootControllerCreateFirstAdmin,
  useRootControllerGetMetadata,
} from "@/services/apis/gen/queries";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InitAdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const { data: metadata, isLoading: isLoadingMetadata } =
    useRootControllerGetMetadata();

  const { mutate: createAdmin, isPending: isLoading } =
    useRootControllerCreateFirstAdmin();

  // Redirect to login if system is already initialized
  if (isLoadingMetadata) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm font-medium animate-pulse">
          Checking system status...
        </p>
      </div>
    );
  }

  if (metadata?.isInit) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    createAdmin(
      { data: { email, password } },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => navigate("/login"), 2000);
        },
        onError: (err: unknown) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const errorResponse = (err as any)?.response?.data;
          setError(
            errorResponse?.message ||
              "Failed to create admin. Please try again.",
          );
        },
      },
    );
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-6">
          {success ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h1 className="text-xl font-bold">Admin account created!</h1>
              <p className="text-sm text-muted-foreground">
                Redirecting you to the sign in page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md">
                    <ShieldCheck className="size-6" />
                  </div>
                  <h1 className="text-xl font-bold">Initialize System</h1>
                  <p className="text-center text-sm text-muted-foreground">
                    Create the first admin account to get started.
                    <br />
                    This can only be done once.
                  </p>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Admin email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                      {error}
                    </p>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    )}
                    Create Admin Account
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
        <p className="text-balance text-center text-xs text-muted-foreground">
          This page is only available when the system has not been initialized.
        </p>
      </div>
    </div>
  );
}
