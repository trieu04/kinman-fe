import api from "./api";
import type { Transaction, CreateTransactionDto, TransactionFilter, Category, Wallet } from "../types";

export const transactionService = {
  // Basic CRUD operations
  getAll: async (filter?: TransactionFilter): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>("/transactions", { params: filter });
    return response.data;
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  create: async (dto: CreateTransactionDto): Promise<Transaction> => {
    const response = await api.post<Transaction>("/transactions", dto);
    return response.data;
  },

  update: async (id: string, dto: Partial<CreateTransactionDto>): Promise<Transaction> => {
    const response = await api.patch<Transaction>(`/transactions/${id}`, dto);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },

  // Metadata operations
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>("/categories");
    return response.data;
  },

  getWallets: async (): Promise<Wallet[]> => {
    const response = await api.get<Wallet[]>("/wallets");
    return response.data;
  },
};

export default transactionService;
