import api from "./libs/axios";

export interface IUser {
  id:        number;
  firstName: string;
  lastName:  string;
  email:     string;
  gender:    string;
  role:      "admin" | "cashier";
  createdAt: string;
}

// Paths are relative to baseURL, which already includes /api/v1

export const getUsers = async (): Promise<IUser[]> => {
  const res = await api.get("/users");
  return (res as any).data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const resetPassword = async (id: number, newPassword: string): Promise<void> => {
  await api.patch(`/users/${id}/reset-password`, { newPassword });
};