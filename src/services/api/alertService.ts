import { apiClient } from "./client";
import {
  AlertNotificationRequest,
  AlertNotificationResponse,
} from "./types";

class AlertService {
  async getAll(): Promise<AlertNotificationResponse[]> {
    return apiClient.get<AlertNotificationResponse[]>("/alerts");
  }

  async getById(id: number): Promise<AlertNotificationResponse> {
    return apiClient.get<AlertNotificationResponse>(`/alerts/${id}`);
  }

  async create(
    data: AlertNotificationRequest
  ): Promise<AlertNotificationResponse> {
    return apiClient.post<AlertNotificationResponse>("/alerts", data);
  }

  async update(
    id: number,
    data: AlertNotificationRequest
  ): Promise<AlertNotificationResponse> {
    return apiClient.put<AlertNotificationResponse>(`/alerts/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/alerts/${id}`);
  }

  async markAsResolved(id: number): Promise<AlertNotificationResponse> {
    return this.update(id, {
      elderlyId: 0,
      alertType: "",
      message: "",
      resolved: true,
    });
  }
}

export const alertService = new AlertService();
