import { useMutation } from "@tanstack/react-query";
import {
  authLogin,
  authRegister,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  type PayLoad,
  type RegisterPayload,
  type ForgotPasswordPayload,
  type ResetPasswordPayload,
} from "../service/auth.service";

export const useAuthLogin = () => {
  return useMutation({
    mutationFn: (request: PayLoad) => authLogin(request),
    onError: (error: Error) => {
      console.error("Failed to Login", error);
    },
  });
};

export const useAuthRegister = () => {
  return useMutation({
    mutationFn: (request: RegisterPayload) => authRegister(request),
    onError: (error: Error) => {
      console.error("Failed to Register", error);
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => resendVerificationEmail(email),
    onError: (error: Error) => {
      console.error("Failed to resend verification email", error);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
    onError: (error: Error) => {
      console.error("Failed to request password reset", error);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
    onError: (error: Error) => {
      console.error("Failed to reset password", error);
    },
  });
};