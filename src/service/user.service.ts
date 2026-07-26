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

export const getUsers = async (): Promise<IUser[]> => {
  const res = await api.get("/api/v1/users");
  return (res as any).data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/users/${id}`);
};

export const resetPassword = async (id: number, newPassword: string): Promise<void> => {
  await api.patch(`/api/v1/users/${id}/reset-password`, { newPassword });
};