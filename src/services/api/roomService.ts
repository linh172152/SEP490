import { apiClient } from './client';
import {
  RoomRequest,
  RoomResponse,
  CaregiverDTO,
  RoomElderlySummary,
} from './types';

export const roomService = {
  getAllRooms: async (): Promise<RoomResponse[]> => {
    return apiClient.get<RoomResponse[]>('/api/rooms');
  },

  getRoomById: async (id: number): Promise<RoomResponse> => {
    return apiClient.get<RoomResponse>(`/api/rooms/${id}`);
  },

  createRoom: async (data: RoomRequest): Promise<RoomResponse> => {
    return apiClient.post<RoomResponse>('/api/rooms', data);
  },

  updateRoom: async (id: number, data: RoomRequest): Promise<RoomResponse> => {
    return apiClient.put<RoomResponse>(`/api/rooms/${id}`, data);
  },

  deleteRoom: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/rooms/${id}`);
  },

  addCaregiverToRoom: async (roomId: number, caregiverId: number): Promise<void> => {
    await apiClient.post(`/api/rooms/${roomId}/caregivers/${caregiverId}`, null);
  },

  addElderlyToRoom: async (roomId: number, elderlyId: number): Promise<void> => {
    await apiClient.post(`/api/rooms/${roomId}/elderlies/${elderlyId}`, null);
  },

  assignRobotToRoom: async (roomId: number, robotId: number): Promise<void> => {
    await apiClient.post(`/api/rooms/${roomId}/robot/${robotId}`, null);
  },

  removeCaregiverFromRoom: async (roomId: number, caregiverId: number): Promise<void> => {
    await apiClient.delete(`/api/rooms/caregivers/${caregiverId}`);
  },

  removeElderlyFromRoom: async (roomId: number, elderlyId: number): Promise<void> => {
    await apiClient.delete(`/api/rooms/elderlies/${elderlyId}`);
  },

  unassignRobotFromRoom: async (roomId: number): Promise<void> => {
    await apiClient.delete(`/api/rooms/${roomId}/robot`);
  },

  getCaregiversByRoom: async (roomId: number): Promise<CaregiverDTO[]> => {
    return apiClient.get<CaregiverDTO[]>(`/api/rooms/${roomId}/caregivers`);
  },

  getElderliesByRoom: async (roomId: number): Promise<RoomElderlySummary[]> => {
    return apiClient.get<RoomElderlySummary[]>(`/api/rooms/${roomId}/elderlies`);
  },
};

