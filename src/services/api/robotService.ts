import { apiClient } from "./client";
import {
  RobotRequest,
  RobotResponse,
} from "./types";

class RobotService {
  async getAll(): Promise<RobotResponse[]> {
    return apiClient.get<RobotResponse[]>("/api/robots");
  }

  async getById(id: number): Promise<RobotResponse> {
    return apiClient.get<RobotResponse>(`/api/robots/${id}`);
  }

  async create(data: RobotRequest): Promise<RobotResponse> {
    return apiClient.post<RobotResponse>("/api/robots", data);
  }

  async update(id: number, data: RobotRequest): Promise<RobotResponse> {
    return apiClient.put<RobotResponse>(`/api/robots/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/robots/${id}`);
  }

  /**
   * Fetch Rooms (Real API)
   */
  async getRooms(): Promise<Record<string, unknown>[]> {
    return apiClient.get<Record<string, unknown>[]>("/api/rooms");
  }
}

export const robotService = new RobotService();
