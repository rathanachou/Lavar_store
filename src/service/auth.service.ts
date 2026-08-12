import api from "./libs/axios";

export interface PayLoad {
  email:    string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName:  string;
  email:     string;
  password:  string;
  gender:    string;
  role:      string;
}

export interface AuthResponse {
  message: string;
  data:    string; // JWT token
}

export interface RegisterResponse {
  message: string;
  data: {
    id:        number;
    firstName: string;
    lastName:  string;
    email:     string;
    role:      string;
    gender:    string;
  };
}

export interface VerifyEmailResponse {
  message: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

//  interceptor unwraps .data already — no need for res.data
//  Paths are relative to baseURL, which already includes /api/v1
export const authLogin = async (request: PayLoad): Promise<AuthResponse> => {
  return api.post("/auth/login", request);
};

export const authRegister = async (
  request: RegisterPayload
): Promise<RegisterResponse> => {
  return api.post("/auth/register", request);
};

export const verifyEmail = async (
  token: string
): Promise<VerifyEmailResponse> => {
  return api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
};

export const resendVerificationEmail = async (
  email: string
): Promise<ResendVerificationResponse> => {
  return api.post("/auth/resend-verification", { email });
};

export const forgotPassword = async (
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> => {
  return api.post("/auth/forgot-password", payload);
};

export const resetPassword = async (
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> => {
  return api.post("/auth/reset-password", payload);
};