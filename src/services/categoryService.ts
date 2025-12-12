import api from "./api";
import type { Category, CreateCategoryDto } from "../types";

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>("/categories");
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (dto: CreateCategoryDto): Promise<Category> => {
    const response = await api.post<Category>("/categories", dto);
    return response.data;
  },

  update: async (id: string, dto: Partial<CreateCategoryDto>): Promise<Category> => {
    const response = await api.patch<Category>(`/categories/${id}`, dto);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

export default categoryService;
