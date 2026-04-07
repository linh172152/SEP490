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

  // --- ADMIN TECHNICAL OPERATIONS (FR17) ---

  /**
   * Simulate OTA Firmware Update
   */
  async updateFirmware(robotId: number, version: string): Promise<void> {
    console.log(`[Admin] Initiating OTA Update for Robot #${robotId} to version ${version}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    // In production, this would call PATCH /api/robots/${robotId}/firmware
  }

  /**
   * Simulate Global Hardware Feature Toggle
   */
  async toggleHardwareFeature(feature: string, status: boolean): Promise<void> {
    console.log(`[Admin] Global Toggle: ${feature} set to ${status ? 'ON' : 'OFF'}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    // In production, this would call POST /api/robots/global-toggle
  }

  /**
   * Fetch Rooms (Mocked until BE creates Room entity)
   */
  async getRooms(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 101, name: "Room 101 (Geriatrics)", elderlyCount: 3, floor: 1 },
      { id: 102, name: "Room 102 (ICU)", elderlyCount: 1, floor: 1 },
      { id: 201, name: "Room 201 (Post-Op)", elderlyCount: 4, floor: 2 },
      { id: 205, name: "Room 205 (Standard)", elderlyCount: 2, floor: 2 },
    ];
  }

  // --- Robot Status Logs ---
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
