export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon?: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: "cash" | "card" | "e_wallet";
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  note?: string;
  imageUrl?: string;
  category: Category;
  wallet: Wallet;
}

export interface CreateTransactionDto {
  amount: number;
  date?: string;
  note?: string;
  categoryId: string;
  walletId: string;
}

export interface TransactionFilterDto {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  walletId?: string;
}
