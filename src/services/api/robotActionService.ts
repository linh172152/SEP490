import { apiClient } from "./client";
import {
  RobotActionLibrary,
  RobotAction
} from "./types";


class RobotActionService {
  // Action Library
  async getAllActions(): Promise<RobotActionLibrary[]> {
    return apiClient.get<RobotActionLibrary[]>("/api/action-library");
  }

  async createAction(data: Partial<RobotActionLibrary>): Promise<RobotActionLibrary> {
    return apiClient.post<RobotActionLibrary>("/api/action-library", data);
  }

  async deleteAction(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/action-library/${id}`);
  }

  async updateAction(id: number, data: Partial<RobotActionLibrary>): Promise<RobotActionLibrary> {
    return apiClient.put<RobotActionLibrary>(`/api/action-library/${id}`, data);
  }

  // Robot Execution
  async triggerAction(actionCode: string): Promise<RobotAction> {
    return apiClient.post<RobotAction>("/api/robot-action", { action: actionCode });
  }

  async getLatestAction(): Promise<RobotAction | null> {
    return apiClient.get<RobotAction | null>("/api/robot-action/latest");
  }
}

export const robotActionService = new RobotActionService();
