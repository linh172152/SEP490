import { apiClient } from './client';
import { RobotActionLibrary, ServicePackageRequest, ServicePackageResponse } from './types';

class ServicePackageService {
  async getAll(): Promise<ServicePackageResponse[]> {
    return apiClient.get<ServicePackageResponse[]>("/api/service-packages");
  }

  async getById(id: number): Promise<ServicePackageResponse> {
    return apiClient.get<ServicePackageResponse>(`/api/service-packages/${id}`);
  }

  async create(data: ServicePackageRequest): Promise<ServicePackageResponse> {
    return apiClient.post<ServicePackageResponse>('/api/service-packages/auto', data);
  }

  async update(id: number, data: ServicePackageRequest): Promise<ServicePackageResponse> {
    return apiClient.put<ServicePackageResponse>(`/api/service-packages/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/service-packages/${id}`);
  }

  // Cập nhật gọi endpoint /robot-actions theo cấu trúc BE mới
  async getActions(pkgId: number): Promise<RobotActionLibrary[]> {
    return apiClient.get<RobotActionLibrary[]>(`/api/service-packages/${pkgId}/robot-actions`);
  }

  async updateActions(pkgId: number, actionIds: number[], pkgData: ServicePackageResponse): Promise<void> {
    // BE hiện tại xử lý mapping thông qua endpoint update package chính
    const updateData: ServicePackageRequest = {
      name: pkgData.name,
      description: pkgData.description,
      level: pkgData.level,
      price: pkgData.price,
      active: pkgData.active,
      durationDays: pkgData.durationDays,
      robotActionIds: actionIds
    };
    return apiClient.put<void>(`/api/service-packages/${pkgId}`, updateData);
  }

  async createAuto(data: ServicePackageRequest): Promise<ServicePackageResponse> {
    return apiClient.post<ServicePackageResponse>('/api/service-packages/auto', data);
  }
}

export const servicePackageService = new ServicePackageService();
