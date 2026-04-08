import { apiClient } from "./client";
import {
  ReminderRequest,
  ReminderResponse,
  ReminderLogRequest,
  ReminderLogResponse,
} from "./types";

class ReminderService {
  async getAll(): Promise<ReminderResponse[]> {
    return apiClient.get<ReminderResponse[]>("/api/reminders");
  }

  async getById(id: number): Promise<ReminderResponse> {
    return apiClient.get<ReminderResponse>(`/api/reminders/${id}`);
  }

  async create(data: ReminderRequest): Promise<ReminderResponse> {
    return apiClient.post<ReminderResponse>("/api/reminders", data);
  }

  async update(id: number, data: ReminderRequest): Promise<ReminderResponse> {
    return apiClient.put<ReminderResponse>(`/api/reminders/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/reminders/${id}`);
  }

  // Reminder Logs
  async getAllLogs(): Promise<ReminderLogResponse[]> {
    return apiClient.get<ReminderLogResponse[]>("/api/reminder-logs");
  }

  async getLogById(id: number): Promise<ReminderLogResponse> {
    return apiClient.get<ReminderLogResponse>(`/api/reminder-logs/${id}`);
  }

  async createLog(data: ReminderLogRequest): Promise<ReminderLogResponse> {
    return apiClient.post<ReminderLogResponse>("/api/reminder-logs", data);
  }

  async confirmLog(id: number): Promise<ReminderLogResponse> {
    return apiClient.post<ReminderLogResponse>(
      `/api/reminder-logs/${id}/confirm`,
      {}
    );
  }

  async deleteLog(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/reminder-logs/${id}`);
  }
}

export const reminderService = new ReminderService();
