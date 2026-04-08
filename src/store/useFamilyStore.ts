import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  ElderlyProfileResponse, 
  ReminderResponse, 
  UserPackageResponse 
} from '@/services/api/types';
import { elderlyService } from '@/services/api/elderlyService';
import { reminderService } from '@/services/api/reminderService';
import { userPackageService } from '@/services/api/userPackageService';

interface FamilyState {
  elderlyList: ElderlyProfileResponse[];
  reminders: ReminderResponse[];
  userPackages: UserPackageResponse[];
  isLoading: boolean;
  error: string | null;
  isUsingMock: boolean;

  fetchDashboardData: (accountId: number) => Promise<void>;
  generateDemoData: (accountId: number) => void;
  setUsingMock: (value: boolean) => void;
  clearError: () => void;
  purchasePackage: (accountId: number, packageId: number) => Promise<void>;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      elderlyList: [],
      reminders: [],
      userPackages: [],
      isLoading: false,
      error: null,
      isUsingMock: false,

      setUsingMock: (value) => set({ isUsingMock: value }),
      clearError: () => set({ error: null }),

      fetchDashboardData: async (accountId) => {
        if (get().isUsingMock) return;

        set({ isLoading: true, error: null });
        try {
          // Fetch only data relevant to this account
          const [elderly, reminders, packages] = await Promise.all([
            elderlyService.getByAccountId(accountId),
            reminderService.getAll(), // Currently fallback to all, will filter locally
            userPackageService.getAll(),
          ]);

          const elderlyIds = new Set(elderly.map(e => e.id));
          
          set({ 
            elderlyList: elderly,
            reminders: reminders.filter(r => elderlyIds.has(r.elderlyId)), 
            userPackages: packages.filter(p => p.accountId === accountId),
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: 'Cannot load data from API. Try using Demo Data.', 
            isLoading: false 
          });
        }
      },

      generateDemoData: (accountId) => {
        const mockElderly: ElderlyProfileResponse[] = [
          { id: 101, accountId, name: 'Nguyễn Văn A', dateOfBirth: '1945-05-15', healthNotes: 'Cao huyết áp', preferredLanguage: 'Vietnamese', speakingSpeed: 'normal', deleted: false },
          { id: 102, accountId, name: 'Trần Thị B', dateOfBirth: '1950-10-20', healthNotes: 'Tiểu đường type 2', preferredLanguage: 'Vietnamese', speakingSpeed: 'slow', deleted: false },
        ];

        const mockReminders: ReminderResponse[] = [
          { id: 1, elderlyId: 101, caregiverId: 11, title: 'Uống thuốc huyết áp', reminderType: 'medication', scheduleTime: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(), repeatPattern: 'daily', active: true, elderlyName: 'Nguyễn Văn A', caregiverName: 'Caregiver 1' },
          { id: 3, elderlyId: 102, caregiverId: 11, title: 'Kiểm tra đường huyết', reminderType: 'medication', scheduleTime: new Date(new Date().setHours(7, 30, 0, 0)).toISOString(), repeatPattern: 'daily', active: true, elderlyName: 'Trần Thị B', caregiverName: 'Caregiver 1' },
        ];

        const mockPackages: UserPackageResponse[] = [
          { id: 1, accountId, servicePackageId: 3, assignedAt: new Date(Date.now() - 86400000 * 15).toISOString(), expiredAt: new Date(Date.now() + 86400000 * 15).toISOString() },
        ];

        set({
          elderlyList: mockElderly,
          reminders: mockReminders,
          userPackages: mockPackages,
          isUsingMock: true,
          error: null
        });
      },

      purchasePackage: async (accountId, packageId) => {
        if (get().isUsingMock) {
          const newPackage: UserPackageResponse = {
            id: Math.floor(Math.random() * 1000),
            accountId,
            servicePackageId: packageId,
            assignedAt: new Date().toISOString(),
            expiredAt: new Date(Date.now() + 86400000 * 30).toISOString(),
          };
          set({ userPackages: [newPackage] });
          return;
        }

        set({ isLoading: true });
        try {
          await userPackageService.create({
            accountId,
            servicePackageId: packageId,
            assignedAt: new Date().toISOString(),
            expiredAt: new Date(Date.now() + 86400000 * 30).toISOString(),
          });
          const packages = await userPackageService.getAll();
          set({ userPackages: packages.filter(p => p.accountId === accountId), isLoading: false });
        } catch (error: any) {
          set({ error: 'Failed to purchase package', isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'family-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        isUsingMock: state.isUsingMock,
        elderlyList: state.isUsingMock ? state.elderlyList : [],
        reminders: state.isUsingMock ? state.reminders : [],
        userPackages: state.isUsingMock ? state.userPackages : [],
      }),
    }
  )
);
