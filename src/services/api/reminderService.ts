import { apiClient } from "./client";
import {
  ReminderRequest,
  ReminderResponse,
  ReminderLogRequest,
  ReminderLogResponse,
} from "./types";

class ReminderService {
  async getAll(): Promise<ReminderResponse[]> {
    return apiClient.get<ReminderResponse[]>("/reminders");
  }

  async getById(id: number): Promise<ReminderResponse> {
    return apiClient.get<ReminderResponse>(`/reminders/${id}`);
  }

  async create(data: ReminderRequest): Promise<ReminderResponse> {
    return apiClient.post<ReminderResponse>("/reminders", data);
  }

  async update(id: number, data: ReminderRequest): Promise<ReminderResponse> {
    return apiClient.put<ReminderResponse>(`/reminders/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/reminders/${id}`);
  }

  // Reminder Logs
  async getAllLogs(): Promise<ReminderLogResponse[]> {
    return apiClient.get<ReminderLogResponse[]>("/reminder-logs");
  }

  async getLogById(id: number): Promise<ReminderLogResponse> {
    return apiClient.get<ReminderLogResponse>(`/reminder-logs/${id}`);
  }

  async createLog(data: ReminderLogRequest): Promise<ReminderLogResponse> {
    return apiClient.post<ReminderLogResponse>("/reminder-logs", data);
  }

  async confirmLog(id: number): Promise<ReminderLogResponse> {
    return apiClient.post<ReminderLogResponse>(
      `/reminder-logs/${id}/confirm`,
      {}
    );
  }

  async deleteLog(id: number): Promise<void> {
    return apiClient.delete<void>(`/reminder-logs/${id}`);
  }
}

export const reminderService = new ReminderService();
