import api from "./libs/axios";

// Paths are relative to baseURL, which already includes /api/v1

export const getCategories = async (search?: string) => {
  return await api.get(`/categories`, { params: { search } });
};
export const getCategoriesList = async () => {
  return await api.get("/categories/list");
};

export const createCategory = async (request: any) => {
  return await api.post("/categories", request);
};

export const updateCategory = async (id: number, request: any) => {
  return await api.put(`/categories/${id}`, request);
};
export const deleteCategory = async (id?: number) => {
  return await api.delete(`/categories/${id}`);
};