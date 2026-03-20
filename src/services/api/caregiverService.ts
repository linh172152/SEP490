import { apiClient } from "./client";
import {
  CaregiverProfileRequest,
  CaregiverProfileResponse,
} from "./types";

class CaregiverService {
  async getAll(): Promise<CaregiverProfileResponse[]> {
    return apiClient.get<CaregiverProfileResponse[]>("/caregiver-profiles");
  }

  async getById(id: number): Promise<CaregiverProfileResponse> {
    return apiClient.get<CaregiverProfileResponse>(`/caregiver-profiles/${id}`);
  }

  async create(data: CaregiverProfileRequest): Promise<CaregiverProfileResponse> {
    return apiClient.post<CaregiverProfileResponse>(
      "/caregiver-profiles",
      data
    );
  }

  async update(
    id: number,
    data: CaregiverProfileRequest
  ): Promise<CaregiverProfileResponse> {
    return apiClient.put<CaregiverProfileResponse>(
      `/caregiver-profiles/${id}`,
      data
    );
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/caregiver-profiles/${id}`);
  }
}

export const caregiverService = new CaregiverService();
