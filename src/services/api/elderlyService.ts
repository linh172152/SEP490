import { apiClient } from "./client";
import {
  ElderlyProfileRequest,
  ElderlyProfileResponse,
} from "./types";

class ElderlyService {
  async getAll(): Promise<ElderlyProfileResponse[]> {
    return apiClient.get<ElderlyProfileResponse[]>("/elderly-profile");
  }

  async getById(id: number): Promise<ElderlyProfileResponse> {
    return apiClient.get<ElderlyProfileResponse>(`/elderly-profile/${id}`);
  }

  async create(
    accountId: number,
    data: ElderlyProfileRequest
  ): Promise<ElderlyProfileResponse> {
    return apiClient.post<ElderlyProfileResponse>(
      `/elderly-profile/${accountId}`,
      data
    );
  }

  async update(
    id: number,
    data: ElderlyProfileRequest
  ): Promise<ElderlyProfileResponse> {
    return apiClient.put<ElderlyProfileResponse>(
      `/elderly-profile/${id}`,
      data
    );
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/elderly-profile/${id}`);
  }
}

export const elderlyService = new ElderlyService();
