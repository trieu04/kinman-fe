import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle";
import { NavbarLogo } from "./NavbarLogo";
import { NavLinks } from "./NavLinks";
import { UserMenu } from "./UserMenu";
import { MobileMenuToggle } from "./MobileMenuToggle";
import { navLinks } from "@/lib/navbar-config";

interface NavbarProps {
  onQuickAddClick: () => void;
  onHomeClick?: () => void;
}

export function Navbar({ onQuickAddClick, onHomeClick }: NavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  return (
    <nav className="fixed top-4 left-4 right-4 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-2xl bg-card/75 border border-border/50 rounded-2xl shadow-lg shadow-black/5 px-5 py-3.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <NavbarLogo onHomeClick={onHomeClick} />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <NavLinks links={navLinks} />
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Quick Add Button */}
              <Button
                onClick={onQuickAddClick}
                className="bg-linear-to-r from-primary to-amber-500 hover:opacity-90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 border-0"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Quick Add</span>
              </Button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Menu */}
              <UserMenu />

              {/* Mobile Menu Toggle */}
              <MobileMenuToggle
                isOpen={showMobileMenu}
                onToggle={() => setShowMobileMenu(!showMobileMenu)}
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pt-4 border-t border-border">
              <NavLinks
                links={navLinks}
                isMobile
                onLinkClick={() => setShowMobileMenu(false)}
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
