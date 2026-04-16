import { apiClient } from "./client";
import { ExerciseScriptResponse, ServicePackageRequest, ServicePackageResponse } from "./types";

class ServicePackageService {
  async getAll(): Promise<ServicePackageResponse[]> {
    return apiClient.get<ServicePackageResponse[]>("/api/service-packages");
  }

  async getById(id: number): Promise<ServicePackageResponse> {
    return apiClient.get<ServicePackageResponse>(`/api/service-packages/${id}`);
  }

  async getExercises(id: number): Promise<ExerciseScriptResponse[]> {
    return apiClient.get<ExerciseScriptResponse[]>(`/api/service-packages/${id}/exercises`);
  }

  async create(data: ServicePackageRequest): Promise<ServicePackageResponse> {
    return apiClient.post<ServicePackageResponse>("/api/service-packages", data);
  }

  async update(id: number, data: ServicePackageRequest): Promise<ServicePackageResponse> {
    return apiClient.put<ServicePackageResponse>(`/api/service-packages/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/service-packages/${id}`);
  }
}

export const servicePackageService = new ServicePackageService();
