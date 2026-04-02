import { apiClient } from "./client";
import { UserPackageRequest, UserPackageResponse } from "./types";

class UserPackageService {
  async getAll(): Promise<UserPackageResponse[]> {
    return apiClient.get<UserPackageResponse[]>("/api/user-packages");
  }

  async getById(id: number): Promise<UserPackageResponse> {
    return apiClient.get<UserPackageResponse>(`/api/user-packages/${id}`);
  }

  async create(data: UserPackageRequest): Promise<UserPackageResponse> {
    return apiClient.post<UserPackageResponse>("/api/user-packages", data);
  }

  async update(id: number, data: UserPackageRequest): Promise<UserPackageResponse> {
    return apiClient.put<UserPackageResponse>(`/api/user-packages/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/user-packages/${id}`);
  }
}

export const userPackageService = new UserPackageService();
