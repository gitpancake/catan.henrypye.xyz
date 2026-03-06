"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun } from "lucide-react";
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

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

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
            <div className="text-xs text-sidebar-foreground/70 mb-2">
              {user.username}
            </div>
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
    </SidebarProvider>
  );
}
