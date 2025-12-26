import * as React from "react";
import { Sun, Moon, Monitor, Sparkles, SparklesIcon } from "lucide-react";
import { useThemeStore } from "../../stores/themeStore";
import type { Theme } from "../../stores/themeStore";
import { cn } from "../../lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, christmasEffectsEnabled, setChristmasEffectsEnabled } = useThemeStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const CurrentIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-xl transition-all duration-200 cursor-pointer",
          "hover:bg-muted/60 text-muted-foreground hover:text-foreground",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        <CurrentIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border bg-card shadow-xl py-1.5 animate-fade-in z-50">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors cursor-pointer",
                theme === value
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
          
          {/* Separator */}
          <div className="my-1.5 mx-2 border-t border-border" />
          
          {/* Christmas Effects Toggle */}
          <button
            onClick={() => {
              setChristmasEffectsEnabled(!christmasEffectsEnabled);
            }}
            className={cn(
              "w-full flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors cursor-pointer",
              "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <div className="flex items-center gap-3">
              {christmasEffectsEnabled ? (
                <Sparkles className="w-4 h-4 text-primary" />
              ) : (
                <SparklesIcon className="w-4 h-4" />
              )}
              <span>Christmas</span>
            </div>
            <div
              className={cn(
                "w-9 h-5 rounded-full transition-colors relative",
                christmasEffectsEnabled ? "bg-primary" : "bg-muted-foreground/30",
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
                  christmasEffectsEnabled ? "translate-x-[18px]" : "translate-x-0.5",
                )}
              />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
