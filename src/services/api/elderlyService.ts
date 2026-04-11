import { apiClient } from "./client";
import {
  ElderlyProfileRequest,
  ElderlyProfileResponse,
} from "./types";
import { mockElderlyProfiles } from "../mockData";

class ElderlyService {
  async getAll(): Promise<ElderlyProfileResponse[]> {
    try {
      const profiles = await apiClient.get<ElderlyProfileResponse[]>("/api/elderly-profile");
      // Merge with mock roomId data for demo
      return profiles.map(profile => {
        const mockProfile = mockElderlyProfiles.find(p => p.id === profile.id);
        return { ...profile, roomId: mockProfile?.roomId };
      });
    } catch (error) {
      console.warn("API not available, using mock data for elderly profiles");
      return mockElderlyProfiles;
    }
  }

  async getByAccountId(accountId: number): Promise<ElderlyProfileResponse[]> {
    try {
      const profiles = await apiClient.get<ElderlyProfileResponse[]>(`/api/elderly-profile/account/${accountId}`);
      // Merge with mock roomId data for demo
      return profiles.map(profile => {
        const mockProfile = mockElderlyProfiles.find(p => p.id === profile.id);
        return { ...profile, roomId: mockProfile?.roomId };
      });
    } catch (error) {
      console.warn("API not available, using mock data for elderly profiles by account");
      return mockElderlyProfiles.filter(p => p.accountId === accountId);
    }
  }

  async getById(id: number): Promise<ElderlyProfileResponse> {
    try {
      const profile = await apiClient.get<ElderlyProfileResponse>(`/api/elderly-profile/${id}`);
      // Merge with mock roomId data for demo
      const mockProfile = mockElderlyProfiles.find(p => p.id === id);
      return { ...profile, roomId: mockProfile?.roomId };
    } catch (error) {
      console.warn(`API not available, using mock data for elderly profile ${id}`);
      const profile = mockElderlyProfiles.find(p => p.id === id);
      if (!profile) throw new Error("Elderly profile not found");
      return profile;
    }
  }

  async create(
    accountId: number,
    data: ElderlyProfileRequest
  ): Promise<ElderlyProfileResponse> {
    try {
      return await apiClient.post<ElderlyProfileResponse>(
        `/api/elderly-profile/${accountId}`,
        data
      );
    } catch (error) {
      console.warn("API not available, simulating elderly profile creation");
      const newProfile: ElderlyProfileResponse = {
        ...data,
        id: Math.max(...mockElderlyProfiles.map(p => p.id)) + 1,
        accountId,
        fullName: data.name,
        deleted: false,
        roomId: null // New profiles start unassigned
      };
      mockElderlyProfiles.push(newProfile);
      return newProfile;
    }
  }

  async update(
    id: number,
    data: ElderlyProfileRequest
  ): Promise<ElderlyProfileResponse> {
    try {
      return await apiClient.put<ElderlyProfileResponse>(
        `/api/elderly-profile/${id}`,
        data
      );
    } catch (error) {
      console.warn("API not available, simulating elderly profile update");
      const index = mockElderlyProfiles.findIndex(p => p.id === id);
      if (index === -1) throw new Error("Elderly profile not found");
      mockElderlyProfiles[index] = { ...mockElderlyProfiles[index], ...data };
      return mockElderlyProfiles[index];
    }
  }

  async delete(id: number): Promise<void> {
    try {
      return await apiClient.delete<void>(`/api/elderly-profile/${id}`);
    } catch (error) {
      console.warn("API not available, simulating elderly profile deletion");
      const index = mockElderlyProfiles.findIndex(p => p.id === id);
      if (index === -1) throw new Error("Elderly profile not found");
      mockElderlyProfiles.splice(index, 1);
    }
  }

  // Mock method for assigning room to elderly
  async assignToRoom(elderlyId: number, roomId: number | null): Promise<ElderlyProfileResponse> {
    const profile = mockElderlyProfiles.find(p => p.id === elderlyId);
    if (!profile) throw new Error("Elderly profile not found");
    profile.roomId = roomId;
    return profile;
  }
}

export const elderlyService = new ElderlyService();
