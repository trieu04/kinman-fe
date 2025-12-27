import api from "./api";
import type { CategoryBreakdown, DailyTrend, MonthlyTrend } from "../types";

// Types
export interface CategorySummary {
    categoryId: string;
    categoryName: string;
    amount: number;
    count: number;
}

export interface GroupSummary {
    groupId: string;
    groupName: string;
    amount: number;
    count: number;
}

export interface UserReportSummary {
    userId: string;
    userName: string;
    totalSpent: number;
    transactionCount: number;
    byCategory: CategorySummary[];
    byGroup: GroupSummary[];
    period: {
        from: string;
        to: string;
    };
}

export interface MemberExpense {
    userId: string;
    userName: string;
    totalPaid: number;
    totalOwed: number;
    balance: number;
}

export interface Debt {
    id: string;
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    amount: number;
    status: 'PENDING' | 'SETTLED';
    settledAt?: string;
}

export interface GroupReportSummary {
    groupId: string;
    groupName: string;
    totalExpense: number;
    memberExpenses: MemberExpense[];
    debts: {
        pending: Debt[];
        settled: Debt[];
    };
}

export interface ReportQuery {
    from?: string;
    to?: string;
}

// Helper function
const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const reportService = {
  // Trend methods
  getCategoryBreakdown: async (year?: number, month?: number): Promise<CategoryBreakdown[]> => {
    const params: Record<string, number> = {};
    if (year)
      params.year = year;
    if (month)
      params.month = month;

    const response = await api.get<CategoryBreakdown[]>("/reports/category-breakdown", { params });
    return response.data;
  },

  getMonthlyTrend: async (year?: number): Promise<MonthlyTrend[]> => {
    const params: Record<string, number> = {};
    if (year)
      params.year = year;

    const response = await api.get<MonthlyTrend[]>("/reports/monthly-trend", { params });
    return response.data;
  },

  getDailyTrend: async (startDate?: string, endDate?: string): Promise<DailyTrend[]> => {
    const params: Record<string, string> = {};
    if (startDate)
      params.startDate = startDate;
    if (endDate)
      params.endDate = endDate;

    const response = await api.get<DailyTrend[]>("/reports/daily-trend", { params });
    return response.data;
  },

  // User and group summary methods
  getUserSummary: async (query: ReportQuery): Promise<UserReportSummary> => {
    const params = new URLSearchParams();
    if (query.from) params.append('from', query.from);
    if (query.to) params.append('to', query.to);

    const response = await api.get(`/reports/user-summary?${params.toString()}`);
    return response.data;
  },

  getGroupSummary: async (
    groupId: string,
    query: ReportQuery
  ): Promise<GroupReportSummary> => {
    const params = new URLSearchParams();
    if (query.from) params.append('from', query.from);
    if (query.to) params.append('to', query.to);

    const response = await api.get(`/reports/group-summary/${groupId}?${params.toString()}`);
    return response.data;
  },

  exportUserReport: async (query: ReportQuery): Promise<void> => {
    const params = new URLSearchParams();
    if (query.from) params.append('from', query.from);
    if (query.to) params.append('to', query.to);

    const response = await api.get(`/reports/export/user?${params.toString()}`, {
        responseType: 'blob',
    });

    downloadBlob(response.data, `user-report-${Date.now()}.csv`);
  },

  exportGroupReport: async (groupId: string, query: ReportQuery): Promise<void> => {
    const params = new URLSearchParams();
    if (query.from) params.append('from', query.from);
    if (query.to) params.append('to', query.to);

    const response = await api.get(`/reports/export/group/${groupId}?${params.toString()}`, {
        responseType: 'blob',
    });

    downloadBlob(response.data, `group-report-${groupId}-${Date.now()}.csv`);
  },
};

// Export named functions for backward compatibility
export const getCategoryBreakdown = reportService.getCategoryBreakdown;
export const getMonthlyTrend = reportService.getMonthlyTrend;
export const getDailyTrend = reportService.getDailyTrend;
export const getUserSummary = reportService.getUserSummary;
export const getGroupSummary = reportService.getGroupSummary;
export const exportUserReport = reportService.exportUserReport;
export const exportGroupReport = reportService.exportGroupReport;

export default reportService;
