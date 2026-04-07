import { create } from 'zustand';
import { CaregiverProfileResponse, CaregiverProfileRequest } from '@/services/api/types';
import { caregiverService } from '@/services/api/caregiverService';

interface CaregiverState {
  currentProfile: CaregiverProfileResponse | null;
  isLoading: boolean;
  error: string | null;

  fetchProfileByAccountId: (accountId: number) => Promise<void>;
  updateProfile: (id: number, data: CaregiverProfileRequest) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
  createProfile: (data: CaregiverProfileRequest) => Promise<void>;
}

export const useCaregiverStore = create<CaregiverState>((set) => ({
  currentProfile: null,
  isLoading: false,
  error: null,

  fetchProfileByAccountId: async (accountId: number) => {
    set({ isLoading: true, error: null });
    try {
      const allProfiles = await caregiverService.getAll();
      const profile = allProfiles.find(p => p.accountId === accountId);
      if (profile) {
        set({ currentProfile: profile });
      } else {
        set({ currentProfile: null });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch caregiver profile' });
    } finally {
      set({ isLoading: false });
    }
  },

  createProfile: async (data: CaregiverProfileRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await caregiverService.create(data);
      set({ currentProfile: response });
    } catch (error: any) {
      set({ error: error.message || 'Failed to create caregiver profile' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (id: number, data: CaregiverProfileRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await caregiverService.update(id, data);
      set({ currentProfile: response });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update caregiver profile' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProfile: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await caregiverService.delete(id);
      set({ currentProfile: null });
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete caregiver profile' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));
