import {
  LayoutDashboard,
  Gamepad2,
  PlusCircle,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  divider?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/enter-results", label: "Enter Results", icon: PlusCircle, divider: true },
  { href: "/leagues", label: "Leagues", icon: Trophy },
  { href: "/players", label: "Players", icon: Users },
];
