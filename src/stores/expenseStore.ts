import { create } from "zustand";
import type { Category, Wallet } from "../types";
import categoryService from "../services/categoryService";
import walletService from "../services/walletService";

interface ExpenseState {
  categories: Category[];
  wallets: Wallet[];
  isLoading: boolean;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchWallets: () => Promise<void>;
  addCategory: (category: Category) => void;
  addWallet: (wallet: Wallet) => void;
}

export const useExpenseStore = create<ExpenseState>()(set => ({
  categories: [],
  wallets: [],
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const categories = await categoryService.getAll();
      set({ categories, isLoading: false });
    }
    catch (_error) {
      set({ isLoading: false });
    }
  },

  fetchWallets: async () => {
    set({ isLoading: true });
    try {
      const wallets = await walletService.getAll();
      set({ wallets, isLoading: false });
    }
    catch (_error) {
      set({ isLoading: false });
    }
  },

  addCategory: category =>
    set(state => ({ categories: [...state.categories, category] })),

  addWallet: wallet =>
    set(state => ({ wallets: [...state.wallets, wallet] })),
}));

export default useExpenseStore;
