import api from "./api";
import type { Transaction, CreateTransactionDto, TransactionFilter } from "../types";

export const transactionService = {
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
};

export default transactionService;
