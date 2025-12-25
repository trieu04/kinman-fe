import { api } from "../../../services/api";
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "../types";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/sign-in", credentials);
    return data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/sign-up", credentials);
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  },
};
