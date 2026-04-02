import { apiClient } from "./client";
import {
  RobotRequest,
  RobotResponse,
  RobotStatusLogRequest,
  RobotStatusLogResponse,
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

  // Robot Status Logs
  async getAllStatusLogs(): Promise<RobotStatusLogResponse[]> {
    return apiClient.get<RobotStatusLogResponse[]>("/api/robot-status-logs");
  }

  async getStatusLogsByRobot(
    robotId: number
  ): Promise<RobotStatusLogResponse[]> {
    return apiClient.get<RobotStatusLogResponse[]>(
      `/api/robot-status-logs/robot/${robotId}`
    );
  }

  async getStatusLogById(id: number): Promise<RobotStatusLogResponse> {
    return apiClient.get<RobotStatusLogResponse>(`/api/robot-status-logs/${id}`);
  }

  async createStatusLog(
    data: RobotStatusLogRequest
  ): Promise<RobotStatusLogResponse> {
    return apiClient.post<RobotStatusLogResponse>("/api/robot-status-logs", data);
  }

  async deleteStatusLog(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/robot-status-logs/${id}`);
  }
}

export const robotService = new RobotService();
