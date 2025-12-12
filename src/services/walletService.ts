import api from "./api";
import type { Wallet, CreateWalletDto } from "../types";

export const walletService = {
  getAll: async (): Promise<Wallet[]> => {
    const response = await api.get<Wallet[]>("/wallets");
    return response.data;
  },

  getById: async (id: string): Promise<Wallet> => {
    const response = await api.get<Wallet>(`/wallets/${id}`);
    return response.data;
  },

  create: async (dto: CreateWalletDto): Promise<Wallet> => {
    const response = await api.post<Wallet>("/wallets", dto);
    return response.data;
  },

  update: async (id: string, dto: Partial<CreateWalletDto>): Promise<Wallet> => {
    const response = await api.patch<Wallet>(`/wallets/${id}`, dto);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/wallets/${id}`);
  },
};

export default walletService;
