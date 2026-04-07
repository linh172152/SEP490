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
          const [elderly, reminders, packages] = await Promise.all([
            elderlyService.getAll(),
            reminderService.getAll(),
            userPackageService.getAll(),
          ]);

          const myElderly = elderly.filter(e => e.accountId === accountId);
          const elderlyIds = new Set(myElderly.map(e => e.id));
          
          set({ 
            elderlyList: myElderly,
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
          { id: 101, accountId, name: 'Nguyễn Văn A', dateOfBirth: '1945-05-15', healthNotes: 'Cao huyết áp', preferredLanguage: 'vi', speakingSpeed: 'normal', deleted: false },
          { id: 102, accountId, name: 'Trần Thị B', dateOfBirth: '1950-10-20', healthNotes: 'Tiểu đường type 2', preferredLanguage: 'vi', speakingSpeed: 'slow', deleted: false },
          { id: 103, accountId, name: 'Lê Văn C', dateOfBirth: '1948-03-12', healthNotes: 'Đau khớp mãn tính', preferredLanguage: 'vi', speakingSpeed: 'normal', deleted: false },
        ];

        const mockReminders: ReminderResponse[] = [
          { id: 1, elderlyId: 101, caregiverId: 11, title: 'Uống thuốc huyết áp', reminderType: 'MEDICINE', scheduleTime: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(), repeatPattern: 'DAILY', active: true, elderlyName: 'Nguyễn Văn A', caregiverName: 'Caregiver 1' },
          { id: 2, elderlyId: 101, caregiverId: 11, title: 'Tập thể dục buổi sáng', reminderType: 'EXERCISE', scheduleTime: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(), repeatPattern: 'DAILY', active: true, elderlyName: 'Nguyễn Văn A', caregiverName: 'Caregiver 1' },
          { id: 3, elderlyId: 102, caregiverId: 11, title: 'Kiểm tra đường huyết', reminderType: 'MEDICINE', scheduleTime: new Date(new Date().setHours(7, 30, 0, 0)).toISOString(), repeatPattern: 'DAILY', active: true, elderlyName: 'Trần Thị B', caregiverName: 'Caregiver 1' },
          { id: 4, elderlyId: 103, caregiverId: 11, title: 'Đi dạo công viên', reminderType: 'EXERCISE', scheduleTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(), repeatPattern: 'MON,WED,FRI', active: true, elderlyName: 'Lê Văn C', caregiverName: 'Caregiver 1' },
          { id: 5, elderlyId: 102, caregiverId: 11, title: 'Uống thuốc bổ', reminderType: 'MEDICINE', scheduleTime: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(), repeatPattern: 'DAILY', active: true, elderlyName: 'Trần Thị B', caregiverName: 'Caregiver 1' },
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
