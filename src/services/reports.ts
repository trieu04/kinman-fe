import api from './api';

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
}export interface MemberExpense {
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

// API Calls
export const getUserSummary = async (query: ReportQuery): Promise<UserReportSummary> => {
    const params = new URLSearchParams();
    if (query.from) params.append('from', query.from);
    if (query.to) params.append('to', query.to);

    const response = await api.get(`/reports/user-summary?${params.toString()}`);
    return response.data;
};

export const getGroupSummary = async (
    groupId: string,
    query: ReportQuery
): Promise<GroupReportSummary> => {
    const params = new URLSearchParams();
    if (query.from) params.append('from', query.from);
    if (query.to) params.append('to', query.to);

    const response = await api.get(`/reports/group-summary/${groupId}?${params.toString()}`);
    return response.data;
};

export const exportUserReport = async (query: ReportQuery): Promise<void> => {
    const params = new URLSearchParams();
    if (query.from) params.append('from', query.from);
    if (query.to) params.append('to', query.to);

    const response = await api.get(`/reports/export/user?${params.toString()}`, {
        responseType: 'blob',
    });

    downloadBlob(response.data, `user-report-${Date.now()}.csv`);
};

export const exportGroupReport = async (groupId: string, query: ReportQuery): Promise<void> => {
    const params = new URLSearchParams();
    if (query.from) params.append('from', query.from);
    if (query.to) params.append('to', query.to);

    const response = await api.get(`/reports/export/group/${groupId}?${params.toString()}`, {
        responseType: 'blob',
    });

    downloadBlob(response.data, `group-report-${groupId}-${Date.now()}.csv`);
};

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
