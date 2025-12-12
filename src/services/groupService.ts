import api from "./api";
import type { Group, CreateGroupDto, GroupExpense, CreateGroupExpenseDto, Debt, SettleUpDto } from "../types";

export const groupService = {
  // Groups
  getAll: async (): Promise<Group[]> => {
    const response = await api.get<Group[]>("/groups");
    return response.data;
  },

  getById: async (id: string): Promise<Group> => {
    const response = await api.get<Group>(`/groups/${id}`);
    return response.data;
  },

  create: async (dto: CreateGroupDto): Promise<Group> => {
    const response = await api.post<Group>("/groups", dto);
    return response.data;
  },

  joinByCode: async (code: string): Promise<Group> => {
    const response = await api.post<Group>("/groups/join", { code });
    return response.data;
  },

  addMember: async (groupId: string, email: string): Promise<void> => {
    await api.post(`/groups/${groupId}/members`, { email });
  },

  // Group Expenses
  getExpenses: async (groupId: string): Promise<GroupExpense[]> => {
    const response = await api.get<GroupExpense[]>(`/groups/${groupId}/expenses`);
    return response.data;
  },

  addExpense: async (groupId: string, dto: CreateGroupExpenseDto): Promise<GroupExpense> => {
    const response = await api.post<GroupExpense>(`/groups/${groupId}/expenses`, dto);
    return response.data;
  },

  // Debts
  getDebts: async (groupId: string): Promise<Debt[]> => {
    const response = await api.get<Debt[]>(`/groups/${groupId}/debts`);
    return response.data;
  },

  settleUp: async (groupId: string, dto: SettleUpDto): Promise<void> => {
    await api.post(`/groups/${groupId}/settle-up`, dto);
  },
};

export default groupService;
