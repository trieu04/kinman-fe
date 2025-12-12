import api from "./api";
import type { CategoryBreakdown, MonthlyTrend } from "../types";

export const reportService = {
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
};

export default reportService;
