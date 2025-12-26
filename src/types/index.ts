// ========== User ==========
export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  avatarUrl?: string;
  createdAt?: string;
}

// ========== Auth ==========
export interface SignInDto {
  username: string;
  password: string;
}

export interface SignUpDto {
  email: string;
  password: string;
  username: string;
  name?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ========== Category ==========
export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  userId: string;
}

export interface CreateCategoryDto {
  name: string;
  icon?: string;
  color?: string;
}

// ========== Wallet ==========
export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
  userId: string;
}

export interface CreateWalletDto {
  name: string;
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
}

// ========== Transaction ==========
export interface Transaction {
  id: string;
  amount: number;
  date: string;
  note?: string;
  imageUrl?: string;
  category?: Category;
  wallet?: Wallet;
  userId: string;
  createdAt: string;
}

export interface TransactionSplit {
  userId: string;
  amount: number;
}

export interface CreateTransactionDto {
  amount: number;
  date?: string;
  note?: string;
  imageUrl?: string;
  categoryId?: string;
  walletId?: string;
  groupId?: string;
  splits?: TransactionSplit[];
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  walletId?: string;
}

// ========== Group ==========
export interface GroupMember {
  id: string;
  userId: string;
  user?: User;
  role?: string;
  isHidden?: boolean;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  members: GroupMember[];
  createdAt: string;
}

export interface CreateGroupDto {
  name: string;
}

// ========== Group Expense ==========
export type SplitType = "equal" | "exact";

export interface ExpenseSplit {
  userId: string;
  amount: number;
}

export interface GroupExpense {
  id: string;
  amount: number;
  description: string;
  date: string;
  splitType: SplitType;
  payer: User;
  splits: ExpenseSplit[];
}

export interface CreateGroupExpenseDto {
  amount: number;
  description: string;
  date?: string;
  splitType: SplitType;
  splits?: ExpenseSplit[];
  paidBy?: string; // User ID who paid for this expense
}

// ========== Debts ==========
export interface Debt {
  from: User;
  to: User;
  amount: number;
}

export interface SettleUpDto {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

// ========== Reports ==========
export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: number;
  year: number;
  total: number;
}

export interface DailyTrend {
  date: string; // ISO date (yyyy-mm-dd)
  total: number;
  count: number;
}

// ========== NLP Parsing ==========
export interface NlpEntity {
  type: "date" | "amount";
  value: string;
  parsedValue: Date | number;
  startIndex: number;
  endIndex: number;
}

export interface NlpParseResult {
  originalText: string;
  entities: NlpEntity[];
  description: string;
  amount?: number;
  date?: Date;
}
