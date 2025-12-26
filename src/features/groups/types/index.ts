import type { User } from "../../auth/types";

export interface Group {
  id: string;
  name: string;
  code: string;
  creator: User;
  members: GroupMember[];
}

export interface GroupMember {
  id: string;
  user: User;
  joinedAt: string;
  isHidden?: boolean;
}

export interface GroupExpense {
  id: string;
  amount: number;
  description: string;
  date: string;
  payer: User;
  splitType: "EQUAL" | "EXACT";
  splits: ExpenseSplit[];
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
}

export interface Debt {
  from: string;
  to: string;
  amount: number;
}

export interface CreateGroupDto {
  name: string;
}

export interface CreateGroupExpenseDto {
  amount: number;
  description: string;
  date?: string;
  payerId: string;
  splitType: "EQUAL" | "EXACT";
  splits?: ExpenseSplit[];
}

export interface SettleUpDto {
  toUserId: string;
  amount: number;
}
