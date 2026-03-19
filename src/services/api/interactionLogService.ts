import { apiClient } from "./client";
import {
  InteractionLogRequest,
  InteractionLogResponse,
} from "./types";

class InteractionLogService {
  async getAll(): Promise<InteractionLogResponse[]> {
    return apiClient.get<InteractionLogResponse[]>("/interaction-logs");
  }

  async getById(id: number): Promise<InteractionLogResponse> {
    return apiClient.get<InteractionLogResponse>(`/interaction-logs/${id}`);
  }

  async create(data: InteractionLogRequest): Promise<InteractionLogResponse> {
    return apiClient.post<InteractionLogResponse>("/interaction-logs", data);
  }

  async updateEmotion(id: number, emotion: string): Promise<InteractionLogResponse> {
    return apiClient.patch<InteractionLogResponse>(
      `/interaction-logs/${id}/emotion?emotion=${emotion}`,
      {}
    );
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/interaction-logs/${id}`);
  }
}

export const interactionLogService = new InteractionLogService();
