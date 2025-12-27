import {
    LayoutDashboard,
    Receipt,
    Users,
    Settings,
    BarChart3,
    type LucideIcon,
} from "lucide-react";

export interface NavLinkItem {
    to: string;
    icon: LucideIcon;
    label: string;
}

export const navLinks: NavLinkItem[] = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/transactions", icon: Receipt, label: "Transaction" },
    { to: "/groups", icon: Users, label: "Groups" },
    { to: "/reports/user", icon: BarChart3, label: "Report" },
    { to: "/settings", icon: Settings, label: "Settings" },
];
