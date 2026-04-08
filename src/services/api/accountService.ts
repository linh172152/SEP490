import { apiClient } from "./client";
import { AccountResponse, RegisterDTO } from "./types";

export interface AccountListResponse {
  data: AccountResponse[];
  total: number;
}

export const accountService = {
  // Get all accounts
  getAccounts: async (): Promise<AccountResponse[]> => {
    try {
      const response = await apiClient.get<AccountResponse[]>("/api/getAllAccount");
      return response;
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      throw error;
    }
  },

  // Get account by ID
  getAccountById: async (id: number): Promise<AccountResponse> => {
    return apiClient.get<AccountResponse>(`/api/${id}`);
  },

  // Create new account (for internal operational accounts like MANAGER/ADMIN)
  createAccount: async (data: RegisterDTO): Promise<AccountResponse> => {
    const payload = {
      fullName: data.name,
      gender: data.gender,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role
    };
    return apiClient.post<AccountResponse>("/api/admin/create-account", payload);
  },

  // Update existing account
  updateAccount: async (id: number | string, data: Partial<RegisterDTO> & { deleted?: boolean }): Promise<AccountResponse> => {
    const payload = {
      fullName: data.name,
      gender: data.gender,
      phone: data.phone,
      password: data.password,
      role: data.role,
      deleted: data.deleted // NEW: Boolean flag from BE
    };

    // Only send fields that are not undefined
    const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined));

    return apiClient.put<AccountResponse>(`/api/${id}`, cleanPayload);
  },

  // True delete if needed
  deleteAccount: async (id: number | string): Promise<void> => {
    return apiClient.delete<void>(`/api/${id}`);
  }
};
