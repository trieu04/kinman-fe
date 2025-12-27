
import { NavLink } from "react-router-dom";
import { Wallet } from "lucide-react";

interface NavbarLogoProps {
    onHomeClick?: () => void;
}

export function NavbarLogo({ onHomeClick }: NavbarLogoProps) {
    return (
        <NavLink
            to="/"
            className="flex items-center gap-3 cursor-pointer group"
            onClick={onHomeClick}
        >
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300">
                <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold hidden sm:block bg-linear-to-r from-foreground to-muted-foreground bg-clip-text">
                KinMan
            </span>
        </NavLink>
    );
}
