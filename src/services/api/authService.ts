import { apiClient } from "./client";
import {
  LoginRequest,
  RegisterRequest,
  AccountResponse,
  VerifyOtpRequest,
} from "./types";

class AuthService {
  async login(data: LoginRequest): Promise<AccountResponse> {
    return apiClient.post<AccountResponse>("/api/login", data);
  }
  async register(data: RegisterRequest): Promise<AccountResponse> {
    return apiClient.post<AccountResponse>("/api/register", data);
  }

  async verifyOtp(data: VerifyOtpRequest): Promise<string> {
    return apiClient.post<string>(`/api/verify-otp?email=${encodeURIComponent(data.email)}&otp=${encodeURIComponent(data.otp)}`, {});
  }

  async getMe(): Promise<AccountResponse> {
    return apiClient.get<AccountResponse>("/api/me");
  }

  async updateProfile(data: { fullName: string; phone: string; gender: string }): Promise<AccountResponse> {
    return apiClient.put<AccountResponse>("/api/profile", data);
  }

  async changePassword(data: any): Promise<void> {
    return apiClient.post<void>("/api/auth/change-password", data);
  }

  logout(): void {
    apiClient.clearAuthToken();
  }

  setToken(token: string): void {
    apiClient.setAuthToken(token);
  }
}

export const authService = new AuthService();

