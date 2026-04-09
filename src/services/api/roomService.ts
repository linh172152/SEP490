import { apiClient } from "./client";
import { RoomRequest, RoomResponse } from "./types";

class RoomService {
  async getAll(): Promise<RoomResponse[]> {
    return apiClient.get<RoomResponse[]>("/api/rooms");
  }

  async getById(id: number): Promise<RoomResponse> {
    return apiClient.get<RoomResponse>(`/api/rooms/${id}`);
  }

  async create(data: RoomRequest): Promise<RoomResponse> {
    return apiClient.post<RoomResponse>("/api/rooms", data);
  }

  async update(id: number, data: RoomRequest): Promise<RoomResponse> {
    return apiClient.put<RoomResponse>(`/api/rooms/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/rooms/${id}`);
  }
}

export const roomService = new RoomService();