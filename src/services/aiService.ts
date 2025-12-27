import api from "./api";

export interface ParsedTransaction {
  amount: number;
  description: string;
  categoryName: string;
  date: string;
}

export const aiService = {
  parseTransaction: async (text: string): Promise<ParsedTransaction> => {
    const response = await api.post<ParsedTransaction>("/ai/parse-transaction", { text });
    return response.data;
  },
};

export default aiService;
