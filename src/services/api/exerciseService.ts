import { apiClient } from "./client";
import {
  ExerciseSessionRequest,
  ExerciseSessionResponse,
  ExerciseScriptRequest,
  ExerciseScriptResponse,
} from "./types";

class ExerciseService {
  // Exercise Sessions
  async getAllSessions(): Promise<ExerciseSessionResponse[]> {
    return apiClient.get<ExerciseSessionResponse[]>("/api/exercise-sessions");
  }

  async getSessionById(id: number): Promise<ExerciseSessionResponse> {
    return apiClient.get<ExerciseSessionResponse>(`/api/exercise-sessions/${id}`);
  }

  async createSession(
    data: ExerciseSessionRequest
  ): Promise<ExerciseSessionResponse> {
    return apiClient.post<ExerciseSessionResponse>("/api/exercise-sessions", data);
  }

  async updateSession(
    id: number,
    data: ExerciseSessionRequest
  ): Promise<ExerciseSessionResponse> {
    return apiClient.put<ExerciseSessionResponse>(
      `/api/exercise-sessions/${id}`,
      data
    );
  }

  async deleteSession(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/exercise-sessions/${id}`);
  }

  // Exercise Scripts
  async getAllScripts(): Promise<ExerciseScriptResponse[]> {
    return apiClient.get<ExerciseScriptResponse[]>("/api/exercise-scripts");
  }

  async getScriptById(id: number): Promise<ExerciseScriptResponse> {
    return apiClient.get<ExerciseScriptResponse>(`/api/exercise-scripts/${id}`);
  }

  async createScript(
    data: ExerciseScriptRequest
  ): Promise<ExerciseScriptResponse> {
    return apiClient.post<ExerciseScriptResponse>("/api/exercise-scripts", data);
  }

  async updateScript(
    id: number,
    data: ExerciseScriptRequest
  ): Promise<ExerciseScriptResponse> {
    return apiClient.put<ExerciseScriptResponse>(
      `/api/exercise-scripts/${id}`,
      data
    );
  }

  async deleteScript(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/exercise-scripts/${id}`);
  }
}

export const exerciseService = new ExerciseService();
