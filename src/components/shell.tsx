"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProfileDialog from "@/components/profile-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0]?.toUpperCase() ?? "?";
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Group nav items by dividers
  const navGroups: (typeof NAV_ITEMS)[] = [];
  let currentGroup: typeof NAV_ITEMS = [];
  NAV_ITEMS.forEach((item) => {
    if (item.divider && currentGroup.length > 0) {
      navGroups.push(currentGroup);
      currentGroup = [];
    }
    currentGroup.push(item);
  });
  if (currentGroup.length > 0) navGroups.push(currentGroup);

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "13rem" } as React.CSSProperties}
    >
      <Sidebar>
        <SidebarHeader className="px-5 py-5">
          <h1 className="font-mono text-sm font-bold text-sidebar-primary tracking-tight">
            catan.
          </h1>
        </SidebarHeader>
        <SidebarContent>
          {navGroups.map((group, i) => (
            <SidebarGroup key={i} className="py-0">
              {i > 0 && <SidebarSeparator className="mb-1" />}
              <SidebarMenu>
                {group.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        {item.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <Separator className="bg-sidebar-border" />
          <div className="px-2 py-1">
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 mb-2 w-full text-left hover:opacity-80 transition-opacity"
            >
              <Avatar className="size-6">
                {user.photoURL && (
                  <AvatarImage src={user.photoURL} alt={user.displayName ?? ""} />
                )}
                <AvatarFallback className="text-[10px] bg-sidebar-accent text-sidebar-accent-foreground">
                  {getInitials(user.displayName, user.email)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-sidebar-foreground/70 truncate">
                {user.displayName ?? user.email}
              </span>
            </button>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-auto p-0 text-xs text-sidebar-foreground/70 hover:text-sidebar-primary hover:bg-transparent"
              >
                Sign out
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-sidebar-foreground/70 hover:text-sidebar-primary"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="size-3.5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute size-3.5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center border-b px-4 py-3 lg:px-8">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </SidebarInset>
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </SidebarProvider>
  );
}
