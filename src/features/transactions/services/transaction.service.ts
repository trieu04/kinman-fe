import { api } from "../../../services/api";
import type { CreateTransactionDto, Transaction, TransactionFilterDto, Category, Wallet } from "../types";

export const transactionService = {
  getAll: async (filter?: TransactionFilterDto): Promise<Transaction[]> => {
    const { data } = await api.get<Transaction[]>("/transactions", { params: filter });
    return data;
  },

  create: async (dto: CreateTransactionDto): Promise<Transaction> => {
    const { data } = await api.post<Transaction>("/transactions", dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },

  getCategories: async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>("/categories");
    return data;
  },

  getWallets: async (): Promise<Wallet[]> => {
    const { data } = await api.get<Wallet[]>("/wallets");
    return data;
  },
};
