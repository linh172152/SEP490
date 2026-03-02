import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Elderly, HealthStatus } from '@/types';

interface ElderlyState {
    elderlyList: Elderly[];

    // Actions
    createElderly: (data: Omit<Elderly, 'id' | 'healthStatus'>) => void;
    updateHealthStatus: (elderlyId: string, status: Partial<HealthStatus>) => void;
    assignCaregiver: (elderlyId: string, caregiverId: string) => void;

    // Selectors/Getters (Available via the store instance)
    getElderlyByFamily: (familyId: string) => Elderly[];
    getElderlyByCaregiver: (caregiverId: string) => Elderly[];
    getElderlyById: (id: string) => Elderly | undefined;
}

export const useElderlyStore = create<ElderlyState>()(
    persist(
        (set, get) => ({
            elderlyList: [],

            createElderly: (data) => {
                const newElderly: Elderly = {
                    ...data,
                    id: `elderly-${Date.now()}`,
                    healthStatus: {
                        heartRate: 75,
                        bloodPressure: '120/80',
                        oxygenLevel: 98,
                        sleepHours: 8,
                        moodScore: 70,
                        timestamp: new Date().toISOString(),
                    },
                };
                set((state) => ({
                    elderlyList: [...state.elderlyList, newElderly],
                }));
            },

            updateHealthStatus: (elderlyId, status) => {
                set((state) => ({
                    elderlyList: state.elderlyList.map((e) =>
                        e.id === elderlyId
                            ? {
                                ...e,
                                healthStatus: { ...e.healthStatus, ...status, timestamp: new Date().toISOString() },
                            }
                            : e
                    ),
                }));
            },

            assignCaregiver: (elderlyId, caregiverId) => {
                set((state) => ({
                    elderlyList: state.elderlyList.map((e) =>
                        e.id === elderlyId ? { ...e, caregiverId } : e
                    ),
                }));
            },

            getElderlyByFamily: (familyId) => {
                return get().elderlyList.filter((e) => e.familyId === familyId);
            },

            getElderlyByCaregiver: (caregiverId) => {
                return get().elderlyList.filter((e) => e.caregiverId === caregiverId);
            },

            getElderlyById: (id) => {
                return get().elderlyList.find((e) => e.id === id);
            },
        }),
        {
            name: 'elderly-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        }
    )
);
