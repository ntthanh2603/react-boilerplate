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
import { Phone, MapPin, IdCard, Cake, CheckCircle2 } from "lucide-react";
import {
  useUsersControllerUpdateMe,
} from "@/services/apis/gen/queries";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  // Better Profile from custom API
  const { data: session, refetch } = authClient.useSession();
  const updateProfileMutation = useUsersControllerUpdateMe();

  const [activeTab, setActiveTab] = useState("profile");

  // Profile State
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    address: "",
    cccd: "",
    dateOfBirth: "",
  });
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
      setProfileData({
        name: session.user.name || "",
        phone: (session.user as any).phone || "",
        address: (session.user as any).address?.fullAddress || (session.user as any).address?.detail || (session.user as any).address || "",
        cccd: (session.user as any).cccd || "",
        dateOfBirth: (session.user as any).dateOfBirth
          ? new Date((session.user as any).dateOfBirth).toISOString().split("T")[0]
          : "",
      });
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
      const { error: authError } = await authClient.updateUser({
        name: profileData.name,
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      await updateProfileMutation.mutateAsync({
        data: {
          ...profileData,
          address: { detail: profileData.address }
        },
      });

      toast.success("Profile updated successfully");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Use authClient for avatar if possible, or just toast error if hook is gone
      toast.error("Avatar update is currently managed via custom endpoint, but hook is missing.");
    } catch (error) {
      console.error("Avatar update error:", error);
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
              <div className="space-y-8 animate-in fade-in slide-in-from-right-3 duration-300">
                <div className="relative flex flex-col items-center gap-4 py-6 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl border border-primary/10 shadow-inner">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Avatar className="h-28 w-28 border-4 border-background shadow-xl ring-2 ring-primary/20 relative z-10 transition-transform group-hover:scale-105 duration-300">
                      <AvatarImage
                        src={(session?.user as any)?.media?.url || session?.user?.image || ""}
                      />
                      <AvatarFallback className="text-3xl font-bold bg-primary/5 text-primary">
                        {profileData.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 z-20 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer scale-90 group-hover:scale-100"
                    >
                      <Smartphone className="h-5 w-5 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Update
                      </span>
                    </Label>
                    <input
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    {(session?.user as any)?.isVerifiedKyc && (
                      <div className="absolute -bottom-1 -right-1 z-30 bg-background rounded-full p-1 shadow-lg ring-1 ring-border">
                        <CheckCircle2 className="h-6 w-6 text-primary fill-primary/10" />
                      </div>
                    )}
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-2xl font-black tracking-tight">
                      {profileData.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {session?.user?.email}
                      </p>
                      <div className="h-1 w-1 rounded-full bg-border" />
                      <Badge
                        variant="outline"
                        className="px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider bg-background/50"
                      >
                        {(session?.user as any)?.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 px-1">
                    <div className="h-4 w-1 bg-primary rounded-full transition-all group-hover:h-6" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      General Information
                    </h4>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label
                        htmlFor="name"
                        className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                      >
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                          className="pl-10 h-11 bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label
                        htmlFor="phone"
                        className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                      >
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          placeholder="09xx xxx xxx"
                          className="pl-10 h-11 bg-muted/20 border-border/50"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label
                        htmlFor="cccd"
                        className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                      >
                        Identity Card (CCCD)
                      </Label>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <Input
                          id="cccd"
                          value={profileData.cccd}
                          disabled
                          className="pl-10 h-11 bg-muted border-border/50 opacity-70"
                          placeholder="Verified KYC only"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label
                        htmlFor="dob"
                        className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                      >
                        Date of Birth
                      </Label>
                      <div className="relative">
                        <Cake className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <Input
                          id="dob"
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              dateOfBirth: e.target.value,
                            })
                          }
                          className="pl-10 h-11 bg-muted/20 border-border/50"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                      <Label
                        htmlFor="address"
                        className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                      >
                        Address
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              address: e.target.value,
                            })
                          }
                          placeholder="Enter your detailed residence address"
                          className="pl-10 h-11 bg-muted/20 border-border/50 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                  <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className="min-w-[140px] font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isUpdatingProfile ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Active Sessions</h3>
                  {sessions.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        sessions
                          .filter((s) => s.id !== session?.session.id)
                          .forEach((s) => handleRevokeSession(s.id))
                      }
                      className="text-xs"
                    >
                      Revoke All Other Sessions
                    </Button>
                  )}
                </div>
                {isLoadingSessions ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {sessions.map((s) => (
                      <div
                        key={s.id}
                        className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${
                          s.id === session?.session.id
                            ? "bg-primary/5 border-primary/20"
                            : "bg-muted/30 hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              s.id === session?.session.id
                                ? "bg-primary/10 text-primary"
                                : "bg-muted-foreground/10 text-muted-foreground"
                            }`}
                          >
                            <Smartphone className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {s.userAgent?.includes("Windows")
                                ? "Windows Device"
                                : "Other Device"}
                              {s.id === session?.session.id && (
                                <span className="ml-2 text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
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
                        {s.id !== session?.session.id ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRevokeSession(s.id)}
                            className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            <ShieldCheck className="h-3 w-3 mr-1" /> Active
                          </Badge>
                        )}
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() =>
                          handleRevokeSession(session?.session.id || "")
                        }
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Revoke Current Session
                      </Button>
                    </div>
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
