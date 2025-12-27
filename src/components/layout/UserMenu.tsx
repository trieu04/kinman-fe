import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

export function UserMenu() {
    const navigate = useNavigate();
    const { user, signOut } = useAuthStore();
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const userMenuRef = React.useRef<HTMLDivElement>(null);

    // Close user menu when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = () => {
        signOut();
        navigate("/login");
    };

    return (
        <div className="relative" ref={userMenuRef}>
            <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() ||
                        user?.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-xl py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-border">
                        <p className="font-medium text-sm truncate">
                            {user?.name || user?.username || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {user?.email}
                        </p>
                    </div>
                    <div className="py-1">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
