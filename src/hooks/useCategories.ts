import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoriesList,
  updateCategory,
} from "../service/categories.service";

export const useCategories = (search?: string) => {
  return useQuery({
    queryKey: ["categories", search], 
    queryFn: () => getCategories(search),
  });
};

export const useCategoriesList = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategoriesList(),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"], exact: false }); 
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: any }) =>
      updateCategory(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"], exact: false }); 
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id?: number }) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"], exact: false }); 
    },
  });
};