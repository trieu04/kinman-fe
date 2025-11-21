import { api } from "../../../services/api";
import type { CreateGroupDto, CreateGroupExpenseDto, Debt, Group, GroupExpense, SettleUpDto } from "../types";

export const groupService = {
  getAll: async (): Promise<Group[]> => {
    const { data } = await api.get<Group[]>("/groups");
    return data;
  },

  getOne: async (id: string): Promise<Group> => {
    const { data } = await api.get<Group>(`/groups/${id}`);
    return data;
  },

  create: async (dto: CreateGroupDto): Promise<Group> => {
    const { data } = await api.post<Group>("/groups", dto);
    return data;
  },

  join: async (code: string): Promise<Group> => {
    const { data } = await api.post<Group>("/groups/join", { code });
    return data;
  },

  getExpenses: async (groupId: string): Promise<GroupExpense[]> => {
    const { data } = await api.get<GroupExpense[]>(`/groups/${groupId}/expenses`);
    return data;
  },

  addExpense: async (groupId: string, dto: CreateGroupExpenseDto): Promise<GroupExpense> => {
    const { data } = await api.post<GroupExpense>(`/groups/${groupId}/expenses`, dto);
    return data;
  },

  getDebts: async (groupId: string): Promise<Debt[]> => {
    const { data } = await api.get<Debt[]>(`/groups/${groupId}/debts`);
    return data;
  },

  settleUp: async (groupId: string, dto: SettleUpDto): Promise<void> => {
    await api.post(`/groups/${groupId}/settle-up`, dto);
  },
};
