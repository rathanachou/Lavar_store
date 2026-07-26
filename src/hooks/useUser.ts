import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, deleteUser, resetPassword } from "../service/user.service";
import { authRegister, type RegisterPayload } from "../service/auth.service";
import { toast } from "sonner";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn:  getUsers,
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: () => toast.error("Failed to delete user"),
  });
};

export const useRegisterUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authRegister(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User registered successfully");
    },
    onError: () => toast.error("Failed to register user"),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) =>
      resetPassword(id, newPassword),
    onSuccess: () => toast.success("Password reset successfully"),
    onError:   () => toast.error("Failed to reset password"),
  });
};