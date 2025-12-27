import { NavLink } from "react-router-dom";
import type { NavLinkItem } from "@/lib/navbar-config";

interface NavLinksProps {
    links: NavLinkItem[];
    isMobile?: boolean;
    onLinkClick?: () => void;
}

export function NavLinks({ links, isMobile = false, onLinkClick }: NavLinksProps) {
    if (isMobile) {
        return (
            <div className="space-y-1 animate-slide-in">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={onLinkClick}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`
                        }
                        end={link.to === "/"}
                    >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                    </NavLink>
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1">
            {links.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${isActive
                            ? "bg-primary/15 text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`
                    }
                    end={link.to === "/"}
                >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                </NavLink>
            ))}
        </div>
    );
}
