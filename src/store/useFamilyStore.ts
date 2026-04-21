import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  ElderlyProfileResponse, 
  ReminderResponse, 
  ServicePackageResponse,
  UserPackageResponse 
} from '@/services/api/types';
import { elderlyService } from '@/services/api/elderlyService';
import { reminderService } from '@/services/api/reminderService';
import { roomService } from '@/services/api/roomService';
import { servicePackageService } from '@/services/api/servicePackageService';
import { userPackageService } from '@/services/api/userPackageService';

interface FamilyState {
  elderlyList: ElderlyProfileResponse[];
  reminders: ReminderResponse[];
  userPackages: UserPackageResponse[];
  servicePackages: ServicePackageResponse[];
  roomNames: Record<number, string>;
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
      servicePackages: [],
      roomNames: {},
      isLoading: false,
      error: null,
      isUsingMock: false,

      setUsingMock: (value) => set({ isUsingMock: value }),
      clearError: () => set({ error: null }),

      fetchDashboardData: async (accountId) => {
        set({ isLoading: true, error: null });
        try {
          const elderly = await elderlyService.getByAccountId(accountId);
          const activeElderly = elderly.filter((item) => !item.deleted);
          const activeElderlyIds = new Set(activeElderly.map((item) => item.id));

          const elderlyPackages = await Promise.all(
            activeElderly.map(async (item) => {
              try {
                return await userPackageService.getByElderlyId(item.id);
              } catch {
                return [] as UserPackageResponse[];
              }
            })
          );

          const [accountReminders, allReminders, servicePackages, rooms] = await Promise.all([
            reminderService.getByAccountId(accountId).catch(() => []),
            reminderService.getAll().catch(() => []),
            servicePackageService.getAll().catch(() => []),
            roomService.getAllRooms().catch(() => []),
          ]);

          const mergedReminders = [...accountReminders, ...allReminders.filter((item) => activeElderlyIds.has(item.elderlyId))]
            .reduce<ReminderResponse[]>((acc, reminder) => {
              if (!acc.some((item) => item.id === reminder.id)) {
                acc.push(reminder);
              }

              return acc;
            }, []);

          const roomNames = (rooms || []).reduce<Record<number, string>>((acc, room) => {
            acc[room.id] = room.roomName;
            return acc;
          }, {});

          const mergedPackages = elderlyPackages.flat().reduce<UserPackageResponse[]>((acc, userPackage) => {
            if (!acc.some((item) => item.id === userPackage.id)) {
              acc.push(userPackage);
            }

            return acc;
          }, []);
          
          set({ 
            elderlyList: activeElderly,
            reminders: mergedReminders,
            userPackages: mergedPackages,
            servicePackages: servicePackages || [],
            roomNames,
            isUsingMock: false,
            isLoading: false 
          });
        } catch {
          set({ 
            error: 'Cannot load data from API. Try using Demo Data.', 
            isLoading: false 
          });
        }
      },

      generateDemoData: (accountId) => {
        const mockElderly: ElderlyProfileResponse[] = [
          { id: 101, accountId, name: 'Nguyễn Văn A', dateOfBirth: '1945-05-15', healthNotes: 'Cao huyết áp', preferredLanguage: 'Vietnamese', speakingSpeed: 'normal', gender: 'male', deleted: false },
          { id: 102, accountId, name: 'Trần Thị B', dateOfBirth: '1950-10-20', healthNotes: 'Tiểu đường type 2', preferredLanguage: 'Vietnamese', speakingSpeed: 'slow', gender: 'female', deleted: false },
        ];

        const mockReminders: ReminderResponse[] = [
          { id: 1, elderlyId: 101, caregiverId: 11, title: 'Uống thuốc huyết áp', reminderType: 'medication', scheduleTime: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(), repeatPattern: 'daily', active: true, elderlyName: 'Nguyễn Văn A', caregiverName: 'Caregiver 1' },
          { id: 3, elderlyId: 102, caregiverId: 11, title: 'Kiểm tra đường huyết', reminderType: 'medication', scheduleTime: new Date(new Date().setHours(7, 30, 0, 0)).toISOString(), repeatPattern: 'daily', active: true, elderlyName: 'Trần Thị B', caregiverName: 'Caregiver 1' },
        ];

        const mockPackages: UserPackageResponse[] = [
          { id: 1, accountId, servicePackageId: 3, elderlyProfileId: 101, assignedAt: new Date(Date.now() - 86400000 * 15).toISOString(), expiredAt: new Date(Date.now() + 86400000 * 15).toISOString(), status: 'PAID' },
        ];

        const mockServicePackages: ServicePackageResponse[] = [
          { id: 1, name: 'Basic Care', description: 'Goi co ban', level: 'BASIC', price: 29, active: true, durationDays: 30, robotActions: [] },
          { id: 2, name: 'Standard Care', description: 'Goi tieu chuan', level: 'STANDARD', price: 59, active: true, durationDays: 30, robotActions: [] },
          { id: 3, name: 'Premium Care', description: 'Goi nang cao', level: 'PREMIUM', price: 99, active: true, durationDays: 30, robotActions: [] },
        ];

        set({
          elderlyList: mockElderly,
          reminders: mockReminders,
          userPackages: mockPackages,
          servicePackages: mockServicePackages,
          roomNames: { 1: 'Room 1' },
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
            status: 'PAID'
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
            status: 'PENDING'
          });
          const elderly = await elderlyService.getByAccountId(accountId).catch(() => [] as ElderlyProfileResponse[]);
          const packagesByElderly = await Promise.all(
            elderly
              .filter((item) => !item.deleted)
              .map((item) => userPackageService.getByElderlyId(item.id).catch(() => [] as UserPackageResponse[]))
          );
          set({ userPackages: packagesByElderly.flat(), isLoading: false });
        } catch (error: unknown) {
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
        servicePackages: state.isUsingMock ? state.servicePackages : [],
        roomNames: state.isUsingMock ? state.roomNames : {},
      }),
    }
  )
);
