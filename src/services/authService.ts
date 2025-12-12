import api from "./api";
import type { SignInDto, SignUpDto, AuthResponse, User } from "../types";

export const authService = {
  signIn: async (dto: SignInDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/sign-in", dto);
    return response.data;
  },

  signUp: async (dto: SignUpDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/sign-up", dto);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>("/auth/me", data);
    return response.data;
  },
};

export default authService;
