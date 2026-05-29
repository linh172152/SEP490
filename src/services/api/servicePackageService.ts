import { apiClient } from './client';
import { RobotAction, ServicePackageRequest, ServicePackageResponse } from './types';

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

  async deactivate(id: number, currentData: ServicePackageResponse): Promise<void> {
    // Chuyển sang dùng PUT thay vì PATCH để tránh lỗi 403 Forbidden/CORS
    await this.update(id, {
      name: currentData.name,
      description: currentData.description,
      level: currentData.level,
      price: currentData.price,
      durationDays: currentData.durationDays,
      active: false,
      robotActionIds: currentData.robotActions?.map(a => a.id) || []
    });
  }

  async activate(id: number): Promise<ServicePackageResponse> {
    return apiClient.patch<ServicePackageResponse>(`/api/service-packages/${id}/activate`, {});
  }

  async getRobotActions(pkgId: number): Promise<RobotAction[]> {
    return apiClient.get<RobotAction[]>(`/api/service-packages/${pkgId}/robot-actions`);
  }

  async getByLevel(level: string): Promise<ServicePackageResponse[]> {
    return apiClient.get<ServicePackageResponse[]>(`/api/service-packages/level/${level}`);
  }


  async createAuto(data: ServicePackageRequest): Promise<ServicePackageResponse> {
    return apiClient.post<ServicePackageResponse>('/api/service-packages/auto', data);
  }
}

export const servicePackageService = new ServicePackageService();
