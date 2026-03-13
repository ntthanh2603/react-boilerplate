import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { authClient } from "@/utils/auth-client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { SettingsDialog } from "@/components/settings-dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const location = useLocation();
  const errorHandledRef = useRef<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    const isLinkingError = error === "email_doesn't_match" || error === "ACCOUNT_LINKING_ERROR" || error === "EMAIL_MISMATCH";
    
    if (isLinkingError && errorHandledRef.current !== location.search) {
      errorHandledRef.current = location.search;
      
      // Schedule updates to avoid cascading renders warning
      setTimeout(() => {
        setSettingsOpen(true);
        toast.error("Linking failed: The email of the social account does not match your current email.");

        // Clean up URL without losing other possible params
        const newParams = new URLSearchParams(location.search);
        newParams.delete("error");
        const newSearch = newParams.toString();
        navigate({
          pathname: location.pathname,
          search: newSearch ? `?${newSearch}` : "",
        }, { replace: true });
      }, 0);
    }
  }, [location, navigate]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      document.body.style.pointerEvents = "auto";
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      document.body.style.pointerEvents = "auto";
    }
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="cursor-pointer"
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </SidebarMenu>
  );
}
