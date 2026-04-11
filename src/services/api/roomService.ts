import { apiClient } from './client';
import { RoomRequest, RoomResponse, CaregiverDTO, ElderlyDTO, RobotDTO } from './types';

export const roomService = {
  getAllRooms: async (): Promise<RoomResponse[]> => {
    return apiClient.get<RoomResponse[]>('/api/rooms');
  },

  getAll: async (): Promise<RoomResponse[]> => {
    return apiClient.get<RoomResponse[]>('/api/rooms');
  },

  getRoomById: async (id: number): Promise<RoomResponse> => {
    return apiClient.get<RoomResponse>(`/api/rooms/${id}`);
  },

  getById: async (id: number): Promise<RoomResponse> => {
    return apiClient.get<RoomResponse>(`/api/rooms/${id}`);
  },

  createRoom: async (data: RoomRequest): Promise<RoomResponse> => {
    return apiClient.post<RoomResponse>('/api/rooms', data);
  },

  create: async (data: RoomRequest): Promise<RoomResponse> => {
    return apiClient.post<RoomResponse>('/api/rooms', data);
  },

  updateRoom: async (id: number, data: RoomRequest): Promise<RoomResponse> => {
    return apiClient.put<RoomResponse>(`/api/rooms/${id}`, data);
  },

  update: async (id: number, data: RoomRequest): Promise<RoomResponse> => {
    return apiClient.put<RoomResponse>(`/api/rooms/${id}`, data);
  },

  deleteRoom: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/rooms/${id}`);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/rooms/${id}`);
  },

  addCaregiverToRoom: async (roomId: number, caregiverId: number): Promise<void> => {
    await apiClient.post(`/api/rooms/${roomId}/caregivers/${caregiverId}`, null);
  },

  addElderlyToRoom: async (roomId: number, elderlyId: number): Promise<void> => {
    await apiClient.post(`/api/rooms/${roomId}/elderly/${elderlyId}`, null);
  },

  assignRobotToRoom: async (roomId: number, robotId: number): Promise<void> => {
    await apiClient.post(`/api/rooms/${roomId}/robots/${robotId}`, null);
  },

  removeCaregiverFromRoom: async (roomId: number, caregiverId: number): Promise<void> => {
    await apiClient.delete(`/api/rooms/${roomId}/caregivers/${caregiverId}`);
  },

  removeElderlyFromRoom: async (roomId: number, elderlyId: number): Promise<void> => {
    await apiClient.delete(`/api/rooms/${roomId}/elderly/${elderlyId}`);
  },

  unassignRobotFromRoom: async (roomId: number, robotId: number): Promise<void> => {
    await apiClient.delete(`/api/rooms/${roomId}/robots/${robotId}`);
  },

  getCaregiversByRoom: async (roomId: number): Promise<CaregiverDTO[]> => {
    return apiClient.get<CaregiverDTO[]>(`/api/rooms/${roomId}/caregivers`);
  },

  getElderliesByRoom: async (roomId: number): Promise<ElderlyDTO[]> => {
    return apiClient.get<ElderlyDTO[]>(`/api/rooms/${roomId}/elderlies`);
  },

  getRobotByRoom: async (roomId: number): Promise<RobotDTO> => {
    return apiClient.get<RobotDTO>(`/api/rooms/${roomId}/robot`);
  }
};

