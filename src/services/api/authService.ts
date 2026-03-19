import { apiClient } from "./client";
import {
  LoginRequest,
  RegisterRequest,
  AccountResponse,
} from "./types";

class AuthService {
  async login(data: LoginRequest): Promise<AccountResponse> {
    return apiClient.post<AccountResponse>("/api/login", data);
  }

  async register(data: RegisterRequest): Promise<AccountResponse> {
    return apiClient.post<AccountResponse>("/api/register", data);
  }

  async getMe(): Promise<AccountResponse> {
    return apiClient.get<AccountResponse>("/api/auth/me");
  }

  logout(): void {
    apiClient.clearAuthToken();
  }

  setToken(token: string): void {
    apiClient.setAuthToken(token);
  }
}

export const authService = new AuthService();

