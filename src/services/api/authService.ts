import { apiClient } from "./client";
import {
  LoginRequest,
  RegisterRequest,
  AccountResponse,
  VerifyOtpRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "./types";

class AuthService {
  async login(data: LoginRequest): Promise<AccountResponse> {
    return apiClient.post<AccountResponse>("/api/login", data);
  }
  async register(data: RegisterRequest): Promise<AccountResponse> {
    return apiClient.post<AccountResponse>("/api/register", data);
  }

  async verifyOtp(data: VerifyOtpRequest): Promise<AccountResponse> {
    return apiClient.post<AccountResponse>(`/api/verify-otp?email=${encodeURIComponent(data.email)}&otp=${encodeURIComponent(data.otp)}`, {});
  }

  async getMe(): Promise<AccountResponse> {
    return apiClient.get<AccountResponse>("/api/me");
  }

  async updateProfile(data: { fullName: string; phone: string; gender: string }): Promise<AccountResponse> {
    return apiClient.put<AccountResponse>("/api/profile", data);
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return apiClient.post<void>("/api/change-password", data);
  }
  
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/api/forgot-password", data);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/api/reset-password", data);
  }

  logout(): void {
    apiClient.clearAuthToken();
  }

  setToken(token: string): void {
    apiClient.setAuthToken(token);
  }
}

export const authService = new AuthService();

