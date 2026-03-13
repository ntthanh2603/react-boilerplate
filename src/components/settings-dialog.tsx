"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/utils/auth-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  User,
  Key,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Trash2,
  Loader2,
  Github,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { data: session, refetch } = authClient.useSession();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile State
  const [name, setName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Security State (Password)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2FA State
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [twoFactorStep, setTwoFactorStep] = useState<"idle" | "verify">("idle");

  // Sessions State
  const [sessions, setSessions] = useState<
    {
      id: string;
      token: string;
      userAgent?: string;
      ipAddress?: string;
      createdAt: string | Date;
    }[]
  >([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Accounts State
  const [accounts, setAccounts] = useState<
    { id: string; providerId: string }[]
  >([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
    }
  }, [session]);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const { data } = await authClient.multiSession.listDeviceSessions();
      setSessions(
        data?.map((s) => ({
          id: s.session.id,
          token: s.session.token,
          userAgent: s.session.userAgent || undefined,
          ipAddress: s.session.ipAddress || undefined,
          createdAt: s.session.createdAt,
        })) || [],
      );
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const fetchAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const { data } = await authClient.listAccounts();
      setAccounts(data || []);
    } catch (e) {
      console.error("Failed to fetch accounts", e);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (activeTab === "sessions") fetchSessions();
      if (activeTab === "accounts") fetchAccounts();
    }
  }, [open, activeTab]);

  useEffect(() => {
    if (open) {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      if (
        error === "email_doesn't_match" ||
        error === "ACCOUNT_LINKING_ERROR" ||
        error === "EMAIL_MISMATCH"
      ) {
        setActiveTab("accounts");
      }
    }
  }, [open]);

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      const { error } = await authClient.updateUser({
        name: name,
      });
      if (error) toast.error(error.message);
      else {
        toast.success("Profile updated successfully");
        await refetch();
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setIsChangingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      if (error) toast.error(error.message);
      else {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    setIs2FALoading(true);
    try {
      if (session?.user?.twoFactorEnabled) {
        const { error } = await authClient.twoFactor.disable({
          password: currentPassword,
        });
        if (error) toast.error(error.message);
        else {
          toast.success("2FA disabled");
          await refetch();
        }
      } else {
        if (!currentPassword) {
          toast.error("Please enter your current password first");
          return;
        }

        // Workflow: Always send OTP first
        const { error } = await authClient.twoFactor.sendOtp({});

        if (error) {
          toast.error(error.message || "Failed to send verification code");
        } else {
          setTwoFactorStep("verify");
          toast.info("Verification code sent to your email");
        }
      }
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setIs2FALoading(true);
    try {
      const { error: verifyError } = await authClient.twoFactor.verifyOtp({
        code: otp,
      });

      if (verifyError) {
        toast.error(verifyError.message || "Invalid or expired code");
      } else {
        // After verifying OTP, call enable with password to finalize 2FA enablement
        const { error: enableError } = await authClient.twoFactor.enable({
          password: currentPassword,
        });

        if (enableError) {
          toast.error(
            enableError.message || "Could not finalize 2FA enablement",
          );
        } else {
          toast.success("2FA enabled successfully");
          setTwoFactorStep("idle");
          setOtp("");
          await refetch();
        }
      }
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      const sessionToRevoke = sessions.find((s) => s.id === id);
      if (!sessionToRevoke) return;

      const { error } = await authClient.multiSession.revoke({
        sessionToken: sessionToRevoke.token,
      });
      if (error) toast.error(error.message);
      else {
        toast.success("Session revoked");
        fetchSessions();
        if (sessionToRevoke.id === session?.session.id) {
          onOpenChange(false);
          window.location.href = "/login";
        }
      }
    } catch (e) {
      console.error("Error revoking session:", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[600px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Manage your profile, security, and sessions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r bg-muted/30 p-2 flex flex-col gap-1">
            <Button
              variant={activeTab === "profile" ? "secondary" : "ghost"}
              className="justify-start gap-2"
              onClick={() => setActiveTab("profile")}
            >
              <User className="h-4 w-4" /> Profile
            </Button>
            <Button
              variant={activeTab === "security" ? "secondary" : "ghost"}
              className="justify-start gap-2"
              onClick={() => setActiveTab("security")}
            >
              <Key className="h-4 w-4" /> Security
            </Button>
            <Button
              variant={activeTab === "sessions" ? "secondary" : "ghost"}
              className="justify-start gap-2"
              onClick={() => setActiveTab("sessions")}
            >
              <Globe className="h-4 w-4" /> Sessions
            </Button>
            <Button
              variant={activeTab === "accounts" ? "secondary" : "ghost"}
              className="justify-start gap-2"
              onClick={() => setActiveTab("accounts")}
            >
              <ShieldCheck className="h-4 w-4" /> Connected
            </Button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Profile Information</h3>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={session?.user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <div className="grid gap-2">
                    <Label htmlFor="current">Current Password</Label>
                    <Input
                      id="current"
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input
                      id="new"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !newPassword}
                  >
                    {isChangingPassword && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Password
                  </Button>
                </div>

                <div className="pt-6 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Secure your account with email OTP codes.
                      </p>
                    </div>
                    {session?.user?.twoFactorEnabled ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-amber-600 border-amber-200 bg-amber-50"
                      >
                        <ShieldAlert className="h-3 w-3 mr-1" /> Inactive
                      </Badge>
                    )}
                  </div>

                  {twoFactorStep === "verify" ? (
                    <div className="flex gap-4 items-end p-4 bg-muted rounded-lg animate-in zoom-in-95">
                      <div className="flex-1 space-y-2">
                        <Label>Enter 6-digit Code</Label>
                        <Input
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>
                      <Button
                        onClick={handleVerify2FA}
                        disabled={is2FALoading || otp.length < 6}
                      >
                        Verify
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setTwoFactorStep("idle")}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant={
                        session?.user?.twoFactorEnabled
                          ? "destructive"
                          : "default"
                      }
                      onClick={handleToggle2FA}
                      disabled={is2FALoading}
                    >
                      {session?.user?.twoFactorEnabled
                        ? "Disable 2FA"
                        : "Enable Email 2FA"}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {activeTab === "sessions" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                <h3 className="text-lg font-medium">Active Sessions</h3>
                {isLoadingSessions ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {sessions.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                      >
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {s.userAgent?.includes("Windows")
                                ? "Windows Device"
                                : "Other Device"}
                              {s.id === session?.session.id && (
                                <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {s.ipAddress || "Unknown IP"} •{" "}
                              {s.createdAt
                                ? new Date(s.createdAt).toLocaleDateString()
                                : "Unknown date"}
                            </p>
                          </div>
                        </div>
                        {s.id !== session?.session.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRevokeSession(s.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="link"
                      className="text-xs text-destructive hover:no-underline"
                      onClick={() =>
                        handleRevokeSession(session?.session.id || "")
                      }
                    >
                      Revoke Current Session
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "accounts" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                <h3 className="text-lg font-medium">Connected Accounts</h3>
                {isLoadingAccounts ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Github className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-medium">Google</p>
                      </div>
                      {accounts.some((a) => a.providerId === "google") ? (
                        <Button variant="outline" size="sm">
                          Unlink
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={async () => {
                            const { error } = await authClient.linkSocial({
                              provider: "google",
                              callbackURL: window.location.href,
                              errorCallbackURL: "http://localhost:5173",
                            });
                            if (error) {
                              toast.error(error.message);
                            } else {
                              toast.success("Account linked successfully");
                              fetchAccounts();
                            }
                          }}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
