import React, { useState } from "react";
import { 
  Building2, 
  Mail, 
  Ticket, 
  ArrowRight, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  useReferrersControllerRegisterMerchant, 
  useReferrersControllerRegisterClinic 
} from "@/services/apis/gen/queries";
import { toast } from "sonner";

export default function RegisterPartner() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") === "clinic" ? "clinic" : "merchant";
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const registerMerMutation = useReferrersControllerRegisterMerchant();
  const registerCliMutation = useReferrersControllerRegisterClinic();

  const isLoading = registerMerMutation.isPending || registerCliMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (role === "merchant") {
        await registerMerMutation.mutateAsync({
          data: { email, referralCode, name, phone }
        });
      } else {
        await registerCliMutation.mutateAsync({
          data: { email, referralCode, name, phone }
        });
      }
      setIsSubmitted(true);
      toast.success("Verification email sent!");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Registration failed. Check your data.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10 mesh-gradient">
        <div className="relative z-10 w-full max-w-sm text-center glass rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl">
          <div className="size-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <CheckCircle2 className="size-10" />
          </div>
          <h2 className="text-3xl font-bold">Check Your Email</h2>
          <p className="text-muted-foreground">
            We've sent a verification link to <span className="font-bold text-foreground">{email}</span>. 
            Please check your inbox to continue registration.
          </p>
          <Button asChild variant="outline" className="rounded-xl w-full">
            <Link to="/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10 mesh-gradient">
      {/* Background Ornament */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl p-2 shadow-2xl overflow-hidden">
          <div className="bg-card/50 backdrop-blur-md rounded-2xl p-6 sm:p-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-xl border border-primary/10">
                    <Building2 className="size-8" />
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <h1 className="text-4xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent capitalize">
                      {role} Partner
                    </span>
                  </h1>
                  <p className="text-sm text-muted-foreground/80">
                    Enter your referral code to start your registration.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="group relative">
                  <Label htmlFor="email" className="text-xs font-semibold ml-1 mb-1.5 block text-muted-foreground/70 group-focus-within:text-primary transition-colors">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="business@example.com" 
                      className="h-12 pl-10 rounded-xl bg-white/50 dark:bg-white/5 border-border/50 focus-visible:ring-primary/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="group relative">
                  <Label htmlFor="name" className="text-xs font-semibold ml-1 mb-1.5 block text-muted-foreground/70 group-focus-within:text-primary transition-colors">
                    Business Name
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="name" 
                      placeholder="Your Business Name" 
                      className="h-12 pl-10 rounded-xl bg-white/50 dark:bg-white/5 border-border/50 focus-visible:ring-primary/20"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="group relative">
                  <Label htmlFor="phone" className="text-xs font-semibold ml-1 mb-1.5 block text-muted-foreground/70 group-focus-within:text-primary transition-colors">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="phone" 
                      placeholder="0912345678" 
                      className="h-12 pl-10 rounded-xl bg-white/50 dark:bg-white/5 border-border/50 focus-visible:ring-primary/20"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="group relative">
                  <Label htmlFor="code" className="text-xs font-semibold ml-1 mb-1.5 block text-muted-foreground/70 group-focus-within:text-primary transition-colors">
                    Referral Code
                  </Label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="code" 
                      placeholder="ENTER CODE" 
                      className="h-12 pl-10 rounded-xl bg-white/50 dark:bg-white/5 border-border/50 focus-visible:ring-primary/20 font-mono"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin size-4 mr-2" />
                      Sending Link...
                    </>
                  ) : (
                    <>
                      Register Now
                      <ArrowRight className="size-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="flex justify-center gap-4 text-sm mt-2">
                   <button 
                    type="button"
                    onClick={() => {
                       const url = new URL(window.location.href);
                       url.searchParams.set("role", role === "merchant" ? "clinic" : "merchant");
                       window.history.pushState({}, '', url);
                       window.location.reload(); 
                    }}
                    className="text-primary hover:underline"
                   >
                     Switch to {role === 'merchant' ? 'Clinic' : 'Merchant'}
                   </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
