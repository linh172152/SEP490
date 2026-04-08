import { apiClient } from "./client";
import {
  CaregiverProfileRequest,
  CaregiverProfileResponse,
} from "./types";

class CaregiverService {
  async getAll(): Promise<CaregiverProfileResponse[]> {
    return apiClient.get<CaregiverProfileResponse[]>("/api/caregiver-profiles");
  }

  async getById(id: number): Promise<CaregiverProfileResponse> {
    return apiClient.get<CaregiverProfileResponse>(`/api/caregiver-profiles/${id}`);
  }

  async create(data: CaregiverProfileRequest): Promise<CaregiverProfileResponse> {
    return apiClient.post<CaregiverProfileResponse>(
      "/api/caregiver-profiles",
      data
    );
  }

  async update(
    id: number,
    data: CaregiverProfileRequest
  ): Promise<CaregiverProfileResponse> {
    return apiClient.put<CaregiverProfileResponse>(
      `/api/caregiver-profiles/${id}`,
      data
    );
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/caregiver-profiles/${id}`);
  }

  async getByAccountId(accountId: number): Promise<CaregiverProfileResponse[]> {
    return apiClient.get<CaregiverProfileResponse[]>(`/api/caregiver-profiles/account/${accountId}`);
  }
}

export const caregiverService = new CaregiverService();
