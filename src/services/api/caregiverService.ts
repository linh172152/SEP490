import { apiClient } from "./client";
import {
  CaregiverProfileRequest,
  CaregiverProfileResponse,
  AccountResponse,
  AlertNotificationResponse,
} from "./types";
import { mockCaregivers, mockElderlyProfiles } from "../mockData";
import { mockAlerts } from "../mock";

class CaregiverService {
  async getAll(): Promise<CaregiverProfileResponse[]> {
    try {
      return await apiClient.get<CaregiverProfileResponse[]>("/api/caregiver-profiles");
    } catch (error) {
      console.warn("API not available, using mock data for caregivers");
      // Convert mock caregivers to CaregiverProfileResponse format
      return mockCaregivers.map(c => ({
        id: c.id,
        accountId: c.id,
        name: c.fullName,
        relationship: 'Caregiver',
        notificationPreference: 'Email',
        accountEmail: c.email,
      }));
    }
  }

  async getById(id: number): Promise<CaregiverProfileResponse> {
    try {
      return await apiClient.get<CaregiverProfileResponse>(`/api/caregiver-profiles/${id}`);
    } catch (error) {
      console.warn(`API not available, using mock data for caregiver ${id}`);
      const caregiver = mockCaregivers.find(c => c.id === id);
      if (!caregiver) throw new Error("Caregiver not found");
      return {
        id: caregiver.id,
        accountId: caregiver.id,
        name: caregiver.fullName,
        relationship: 'Caregiver',
        notificationPreference: 'Email',
        accountEmail: caregiver.email,
      };
    }
  }

  async create(data: CaregiverProfileRequest): Promise<CaregiverProfileResponse> {
    try {
      return await apiClient.post<CaregiverProfileResponse>(
        "/api/caregiver-profiles",
        data
      );
    } catch (error) {
      console.warn("API not available, simulating caregiver creation");
      const newCaregiver: CaregiverProfileResponse = {
        ...data,
        id: Math.max(...mockCaregivers.map(c => c.id)) + 1,
        accountEmail: data.name + '@carebot.com',
        name: data.name
      };
      // Add to mock
      mockCaregivers.push({
        id: newCaregiver.id,
        fullName: data.name,
        gender: 'Unknown',
        email: newCaregiver.accountEmail,
        phone: '',
        token: '',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        role: 'CAREGIVER',
        roomId: null
      });
      return newCaregiver;
    }
  }

  async update(
    id: number,
    data: CaregiverProfileRequest
  ): Promise<CaregiverProfileResponse> {
    try {
      return await apiClient.put<CaregiverProfileResponse>(
        `/api/caregiver-profiles/${id}`,
        data
      );
    } catch (error) {
      console.warn("API not available, simulating caregiver update");
      const index = mockCaregivers.findIndex(c => c.id === id);
      if (index === -1) throw new Error("Caregiver not found");
      const updated = { ...mockCaregivers[index], fullName: data.name };
      mockCaregivers[index] = updated;
      return {
        id: updated.id,
        accountId: updated.id,
        name: updated.fullName,
        relationship: 'Caregiver',
        notificationPreference: 'Email',
        accountEmail: updated.email,
      };
    }
  }

  async delete(id: number): Promise<void> {
    try {
      return await apiClient.delete<void>(`/api/caregiver-profiles/${id}`);
    } catch (error) {
      console.warn("API not available, simulating caregiver deletion");
      const index = mockCaregivers.findIndex(c => c.id === id);
      if (index === -1) throw new Error("Caregiver not found");
      mockCaregivers.splice(index, 1);
    }
  }

  async getByAccountId(accountId: number): Promise<CaregiverProfileResponse[]> {
    try {
      return await apiClient.get<CaregiverProfileResponse[]>(`/api/caregiver-profiles/account/${accountId}`);
    } catch (error) {
      console.warn("API not available, using mock data for caregivers by account");
      return mockCaregivers.filter(c => c.id === accountId).map(c => ({
        id: c.id,
        accountId: c.id,
        name: c.fullName,
        relationship: 'Caregiver',
        notificationPreference: 'Email',
        accountEmail: c.email,
      }));
    }
  }

  // Mock method for assigning room to caregiver
  async assignToRoom(caregiverId: number, roomId: number | null): Promise<AccountResponse> {
    const caregiver = mockCaregivers.find(c => c.id === caregiverId);
    if (!caregiver) throw new Error("Caregiver not found");
    caregiver.roomId = roomId;
    return caregiver;
  }

  // Get all caregivers as AccountResponse with roomId
  async getAllWithRooms(): Promise<AccountResponse[]> {
    try {
      // This would be a new API endpoint
      return await apiClient.get<AccountResponse[]>("/api/caregivers");
    } catch (error) {
      console.warn("API not available, using mock data for caregivers with rooms");
      return mockCaregivers;
    }
  }

  async getAlerts(): Promise<AlertNotificationResponse[]> {
    try {
      return await apiClient.get<AlertNotificationResponse[]>("/api/alerts");
    } catch (error) {
      console.warn("API not available, using mock data for caregiver alerts");
      return mockAlerts.map((alert) => {
        const elderlyIdNumber = parseInt(alert.elderlyId.toString().replace(/\D/g, ''), 10);
        const elderly = mockElderlyProfiles.find((profile) => profile.id === elderlyIdNumber);
        return {
          id: alert.id.startsWith('a') ? parseInt(alert.id.replace(/\D/g, ''), 10) : Number(alert.id),
          elderlyId: elderlyIdNumber,
          elderlyName: elderly?.fullName ?? `Elderly ${elderlyIdNumber}`,
          alertType: alert.type,
          message: alert.message,
          resolved: alert.status === 'resolved',
          createdAt: alert.createdAt,
        };
      });
    }
  }
}

export const caregiverService = new CaregiverService();
