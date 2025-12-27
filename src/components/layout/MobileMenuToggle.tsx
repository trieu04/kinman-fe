
import { Menu, X } from "lucide-react";

interface MobileMenuToggleProps {
    isOpen: boolean;
    onToggle: () => void;
}

export function MobileMenuToggle({ isOpen, onToggle }: MobileMenuToggleProps) {
    return (
        <button
            onClick={onToggle}
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
        >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
    );
}
