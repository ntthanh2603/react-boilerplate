import { AppHeader } from "@/components/app-header";
import { User, ShieldCheck, Activity, Award } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { label: "Account Status", value: "Verified", icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Role", value: "User", icon: User, color: "text-primary", bg: "bg-primary/10" },
    { label: "Last Login", value: "Just now", icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Trust Score", value: "98%", icon: Award, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <>
      <AppHeader title="Dashboard" />
      <div className="flex flex-1 flex-col gap-6 p-6 mesh-gradient/10 min-h-full">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-gradient">Welcome back!</h2>
          <p className="text-muted-foreground">Here's what happening with your account today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] border-primary/5">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="size-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-4 glass rounded-3xl p-8 min-h-[400px] border-primary/5 flex flex-col justify-center items-center text-center gap-4">
             <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Activity className="size-8" />
             </div>
             <h3 className="text-xl font-bold">Activity Overview</h3>
             <p className="text-muted-foreground max-w-sm">No recent activity detected. Connect your services to start seeing data here.</p>
          </div>
          <div className="lg:col-span-3 glass rounded-3xl p-8 min-h-[400px] border-primary/5 flex flex-col gap-6">
            <h3 className="text-xl font-bold">Secruity Tips</h3>
            <div className="space-y-4">
              {[
                "Enable 2FA login for extra security",
                "Regularly update your password",
                "Check active sessions frequently",
                "Monitor login attempts in logs"
              ].map((tip, i) => (
                <div key={i} className="flex gap-3 items-start group">
                  <div className="mt-1 size-5 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <ShieldCheck className="size-3" />
                  </div>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
