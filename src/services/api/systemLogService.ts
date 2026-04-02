import { apiClient } from "./client";
import { SystemLogRequest, SystemLogResponse } from "./types";

class SystemLogService {
  async getAll(): Promise<SystemLogResponse[]> {
    return apiClient.get<SystemLogResponse[]>("/api/system-logs");
  }

  async getById(id: number): Promise<SystemLogResponse> {
    return apiClient.get<SystemLogResponse>(`/api/system-logs/${id}`);
  }

  async create(data: SystemLogRequest): Promise<SystemLogResponse> {
    return apiClient.post<SystemLogResponse>("/api/system-logs", data);
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/system-logs/${id}`);
  }
}

export const systemLogService = new SystemLogService();
