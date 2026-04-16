import { create } from 'zustand';
import { reminderService } from '@/services/api/reminderService';
import { ReminderRequest, ReminderResponse } from '@/services/api/types';

interface FetchRemindersParams {
  accountId?: number;
  caregiverId?: number;
  caregiverIds?: number[];
  elderlyIds?: number[];
}

interface ReminderState {
  reminders: ReminderResponse[];
  isLoading: boolean;
  error: string | null;
  fetchReminders: (params: FetchRemindersParams) => Promise<void>;
  createReminder: (data: ReminderRequest) => Promise<ReminderResponse>;
  updateReminder: (id: number, data: ReminderRequest) => Promise<ReminderResponse>;
  deleteReminder: (id: number) => Promise<void>;
  fetchReminderById: (id: number) => Promise<ReminderResponse>;
  clearError: () => void;
}

export const useReminderStore = create<ReminderState>((set) => ({
  reminders: [],
  isLoading: false,
  error: null,

  fetchReminders: async ({ accountId, caregiverId, caregiverIds, elderlyIds }: FetchRemindersParams) => {
    try {
      set({ isLoading: true, error: null });

      let data: ReminderResponse[] = [];
      const allowedCaregiverIds = new Set(
        [
          ...(caregiverIds ?? []),
          ...(typeof caregiverId === 'number' ? [caregiverId] : []),
        ].filter((value): value is number => typeof value === 'number' && !Number.isNaN(value))
      );

      if (allowedCaregiverIds.size > 0) {
        const allReminders = await reminderService.getAll();
        const assignedElderlyIds = elderlyIds?.length ? new Set(elderlyIds) : null;

        data = allReminders.filter((item) => {
          if (!allowedCaregiverIds.has(item.caregiverId)) {
            return false;
          }

          return assignedElderlyIds ? assignedElderlyIds.has(item.elderlyId) : true;
        });
      } else if (typeof accountId === 'number') {
        data = await reminderService.getByAccountId(accountId);
      }

      set({ reminders: data || [], isLoading: false });
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch reminders', isLoading: false });
    }
  },

  createReminder: async (data: ReminderRequest) => {
    try {
      set({ isLoading: true, error: null });
      const response = await reminderService.create(data);
      set((state) => ({
        reminders: [response, ...state.reminders],
        isLoading: false,
      }));
      return response;
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Failed to create reminder', isLoading: false });
      throw error;
    }
  },

  updateReminder: async (id: number, data: ReminderRequest) => {
    try {
      set({ isLoading: true, error: null });
      const response = await reminderService.update(id, data);
      set((state) => ({
        reminders: state.reminders.map((r) => (r.id === id ? response : r)),
        isLoading: false,
      }));
      return response;
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Failed to update reminder', isLoading: false });
      throw error;
    }
  },

  deleteReminder: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      await reminderService.delete(id);
      set((state) => ({
        reminders: state.reminders.filter((r) => r.id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete reminder', isLoading: false });
      throw error;
    }
  },

  fetchReminderById: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      const response = await reminderService.getById(id);
      set({ isLoading: false });
      return response;
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch reminder detail', isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
