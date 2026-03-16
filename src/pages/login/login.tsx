import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10 mesh-gradient">
      {/* Background Ornament */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-sm">
        <div className="glass rounded-2xl p-2 shadow-2xl">
          <LoginForm className="bg-card/50 backdrop-blur-md rounded-xl p-6 sm:p-8" />
        </div>
      </div>
    </div>
  );
}
