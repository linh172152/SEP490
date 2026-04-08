import { apiClient } from "./client";
import {
  InteractionLogRequest,
  InteractionLogResponse,
} from "./types";

class InteractionLogService {
  async getAll(): Promise<InteractionLogResponse[]> {
    return apiClient.get<InteractionLogResponse[]>("/api/interaction-logs");
  }

  async getById(id: number): Promise<InteractionLogResponse> {
    return apiClient.get<InteractionLogResponse>(`/api/interaction-logs/${id}`);
  }

  async create(data: InteractionLogRequest): Promise<InteractionLogResponse> {
    return apiClient.post<InteractionLogResponse>("/api/interaction-logs", data);
  }

  async updateEmotion(id: number, emotion: string): Promise<InteractionLogResponse> {
    return apiClient.patch<InteractionLogResponse>(
      `/api/interaction-logs/${id}/emotion?emotion=${emotion}`,
      {}
    );
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/interaction-logs/${id}`);
  }
}

export const interactionLogService = new InteractionLogService();
