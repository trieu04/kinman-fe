import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, SignInDto, SignUpDto } from "../types";
import authService from "../services/authService";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  signIn: (dto: SignInDto) => Promise<void>;
  signUp: (dto: SignUpDto) => Promise<void>;
  signOut: () => void;
  fetchUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;

  // Getter for compatibility
  token: string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      signIn: async (dto: SignInDto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.signIn(dto);
          localStorage.setItem("accessToken", response.accessToken);
          set({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        }
        catch (error: any) {
          const message = error.response?.data?.message || "Sign in failed";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      signUp: async (dto: SignUpDto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.signUp(dto);
          localStorage.setItem("accessToken", response.accessToken);
          set({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        }
        catch (error: any) {
          const message = error.response?.data?.message || "Sign up failed";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      signOut: () => {
        localStorage.removeItem("accessToken");
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      fetchUser: async () => {
        const token = get().accessToken || localStorage.getItem("accessToken");
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        }
        catch (_error) {
          localStorage.removeItem("accessToken");
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const updated = await authService.updateProfile(data);
          set({ user: updated, isLoading: false });
        }
        catch (error: any) {
          const message = error?.response?.data?.message || "Update profile failed";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      get token() {
        return this.accessToken;
      },
    }),
    {
      name: "auth-storage",
      partialize: state => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
);

export default useAuthStore;
