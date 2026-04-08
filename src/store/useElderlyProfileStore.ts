import { create } from 'zustand';
import { elderlyService } from '@/services/api/elderlyService';
import { ElderlyProfileResponse, ElderlyProfileRequest } from '@/services/api/types';

interface ElderlyProfileState {
  profiles: ElderlyProfileResponse[];
  currentProfile: ElderlyProfileResponse | null;
  isLoading: boolean;
  error: string | null;

  fetchProfiles: (accountId?: number) => Promise<void>;
  fetchProfileById: (id: number) => Promise<void>;
  fetchProfileByAccountId: (accountId: number) => Promise<void>;
  createProfile: (accountId: number, data: ElderlyProfileRequest) => Promise<void>;
  updateProfile: (id: number, data: ElderlyProfileRequest) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useElderlyProfileStore = create<ElderlyProfileState>((set, get) => ({
  profiles: [],
  currentProfile: null,
  isLoading: false,
  error: null,

  fetchProfiles: async (accountId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = accountId 
        ? await elderlyService.getByAccountId(accountId)
        : await elderlyService.getAll();
      set({ profiles: data });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch profiles' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProfileById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await elderlyService.getById(id);
      set({ currentProfile: data });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch profile' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProfileByAccountId: async (accountId: number) => {
    set({ isLoading: true, error: null });
    try {
      const allProfiles = await elderlyService.getAll();
      const profile = allProfiles.find(p => p.accountId === accountId);
      if (profile) {
        set({ currentProfile: profile });
      } else {
        set({ currentProfile: null });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch profile by account' });
    } finally {
      set({ isLoading: false });
    }
  },

  createProfile: async (accountId: number, data: ElderlyProfileRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newProfile = await elderlyService.create(accountId, data);
      set((state) => ({ 
        profiles: [...state.profiles, newProfile],
        currentProfile: newProfile 
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to create profile' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (id: number, data: ElderlyProfileRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProfile = await elderlyService.update(id, data);
      set((state) => ({
        profiles: state.profiles.map(p => p.id === id ? updatedProfile : p),
        currentProfile: state.currentProfile?.id === id ? updatedProfile : state.currentProfile
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update profile' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProfile: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await elderlyService.delete(id);
      set((state) => ({
        profiles: state.profiles.filter(p => p.id !== id),
        currentProfile: state.currentProfile?.id === id ? null : state.currentProfile
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete profile' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
