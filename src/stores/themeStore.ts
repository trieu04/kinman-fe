import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  christmasEffectsEnabled: boolean;
  setChristmasEffectsEnabled: (enabled: boolean) => void;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined")
    return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolved = theme === "system" ? getSystemTheme() : theme;

  root.classList.remove("light", "dark");
  root.classList.add(resolved);

  return resolved;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      theme: "light",
      resolvedTheme: "light",
      christmasEffectsEnabled: true,
      setTheme: (theme: Theme) => {
        const resolved = applyTheme(theme);
        set({ theme, resolvedTheme: resolved });
      },
      setChristmasEffectsEnabled: (enabled: boolean) => {
        set({ christmasEffectsEnabled: enabled });
      },
    }),
    {
      name: "kinman-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = applyTheme(state.theme);
          state.resolvedTheme = resolved;
        }
      },
    },
  ),
);

// Listen for system theme changes
if (typeof window !== "undefined") {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const { theme, setTheme } = useThemeStore.getState();
    if (theme === "system") {
      setTheme("system");
    }
  });
}
