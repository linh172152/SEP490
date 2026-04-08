import { apiClient } from "./client";
import {
  ElderlyProfileRequest,
  ElderlyProfileResponse,
} from "./types";

class ElderlyService {
  async getAll(): Promise<ElderlyProfileResponse[]> {
    return apiClient.get<ElderlyProfileResponse[]>("/api/elderly-profile");
  }

  async getByAccountId(accountId: number): Promise<ElderlyProfileResponse[]> {
    return apiClient.get<ElderlyProfileResponse[]>(`/api/elderly-profile/account/${accountId}`);
  }

  async getById(id: number): Promise<ElderlyProfileResponse> {
    return apiClient.get<ElderlyProfileResponse>(`/api/elderly-profile/${id}`);
  }

  async create(
    accountId: number,
    data: ElderlyProfileRequest
  ): Promise<ElderlyProfileResponse> {
    return apiClient.post<ElderlyProfileResponse>(
      `/api/elderly-profile/${accountId}`,
      data
    );
  }

  async update(
    id: number,
    data: ElderlyProfileRequest
  ): Promise<ElderlyProfileResponse> {
    return apiClient.put<ElderlyProfileResponse>(
      `/api/elderly-profile/${id}`,
      data
    );
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/elderly-profile/${id}`);
  }
}

export const elderlyService = new ElderlyService();
