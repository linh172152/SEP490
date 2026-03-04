import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Elderly, HealthStatus, Alert, ClinicalNote, ActivityEntry } from '@/types';
import { mockActivityLogs, mockClinicalNotes } from '@/services/mock';

interface ElderlyState {
    elderlyList: Elderly[];
    alerts: Alert[];
    clinicalNotes: ClinicalNote[];

    // Actions
    createElderly: (data: Omit<Elderly, 'id' | 'healthStatus' | 'riskLevel'>) => void;
    updateElderlyProfile: (elderlyId: string, data: Partial<Elderly>) => void;
    updateHealthStatus: (elderlyId: string, status: Partial<HealthStatus>) => void;
    assignCaregiver: (elderlyId: string, caregiverId: string) => void;

    // Alert Actions
    addAlert: (elderlyId: string, data: Omit<Alert, 'id' | 'elderlyId' | 'status' | 'createdAt' | 'resolvedAt'>) => void;
    resolveAlert: (alertId: string) => void;

    // Clinical & Activity Actions (New for Phase F7)
    addClinicalNote: (elderlyId: string, doctorId: string, content: string) => void;
    addActivity: (elderlyId: string, activity: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;

    // Selectors
    getElderlyByFamily: (familyId: string) => Elderly[];
    getElderlyByCaregiver: (caregiverId: string) => Elderly[];
    getElderlyById: (id: string) => Elderly | undefined;
    getActiveAlertsByElderly: (elderlyId: string) => Alert[];
    getActiveAlertsByCaregiver: (caregiverId: string) => Alert[];
    getAlertHistoryByElderly: (elderlyId: string) => Alert[];
}

export const useElderlyStore = create<ElderlyState>()(
    persist(
        (set, get) => ({
            elderlyList: [
                {
                    id: 'p1',
                    name: 'Alice Smith',
                    age: 72,
                    gender: 'FEMALE',
                    familyId: 'user-family-001', // Mock family John Smith
                    caregiverId: 'user-caregiver-001', // Mock caregiver Maria Rodriguez
                    condition: 'Mild Depression',
                    address: '123 Sky Garden Ave',
                    emergencyContact: 'Family: 555-0199',
                    email: 'alice.s@example.com',
                    healthStatus: {
                        heartRate: 75,
                        bloodPressure: '120/80',
                        oxygenLevel: 98,
                        sleepHours: 8,
                        moodScore: 65,
                        cognitiveScore: 82,
                        timestamp: new Date().toISOString(),
                    },
                    riskLevel: 'LOW',
                    activityLog: mockActivityLogs,
                    cognitiveHistory: [
                        { timestamp: new Date(Date.now() - 86400000).toISOString(), score: 80 },
                        { timestamp: new Date().toISOString(), score: 82 },
                    ]
                },
                {
                    id: 'p2',
                    name: 'Robert Johnson',
                    age: 80,
                    gender: 'MALE',
                    familyId: 'user-family-001',
                    caregiverId: 'user-caregiver-001',
                    condition: 'Severe Anxiety',
                    address: '456 River Run Blvd',
                    emergencyContact: 'Family: 555-0122',
                    email: 'robert.j@example.com',
                    healthStatus: {
                        heartRate: 92,
                        bloodPressure: '145/95',
                        oxygenLevel: 94,
                        sleepHours: 5,
                        moodScore: 40,
                        cognitiveScore: 68,
                        timestamp: new Date().toISOString(),
                    },
                    riskLevel: 'HIGH',
                    activityLog: mockActivityLogs,
                    cognitiveHistory: [
                        { timestamp: new Date(Date.now() - 86400000).toISOString(), score: 72 },
                        { timestamp: new Date().toISOString(), score: 68 },
                    ]
                }
            ],
            alerts: [],
            clinicalNotes: mockClinicalNotes,

            createElderly: (data) => {
                const newElderly: Elderly = {
                    ...data,
                    id: `elderly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    healthStatus: {
                        heartRate: 75,
                        bloodPressure: '120/80',
                        oxygenLevel: 98,
                        sleepHours: 8,
                        moodScore: 70,
                        cognitiveScore: 75,
                        timestamp: new Date().toISOString(),
                    },
                    riskLevel: 'LOW',
                    activityLog: [],
                    cognitiveHistory: []
                };
                set((state) => ({
                    elderlyList: [...state.elderlyList, newElderly],
                }));
            },

            addAlert: (elderlyId, data) => {
                const newAlert: Alert = {
                    ...data,
                    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    elderlyId,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    alerts: [newAlert, ...state.alerts],
                }));
            },

            resolveAlert: (alertId) => {
                set((state) => ({
                    alerts: state.alerts.map((a) =>
                        a.id === alertId
                            ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() }
                            : a
                    ),
                }));
            },

            addClinicalNote: (elderlyId, doctorId, content) => {
                const newNote: ClinicalNote = {
                    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    elderlyId,
                    doctorId,
                    content,
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    clinicalNotes: [...state.clinicalNotes, newNote],
                }));
            },

            addActivity: (elderlyId, activity) => {
                set((state) => ({
                    elderlyList: state.elderlyList.map((e) =>
                        e.id === elderlyId
                            ? {
                                ...e,
                                activityLog: [
                                    ...(e.activityLog || []),
                                    {
                                        ...activity,
                                        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                        timestamp: new Date().toISOString(),
                                    },
                                ],
                            }
                            : e
                    ),
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

            updateElderlyProfile: (elderlyId, data) => {
                set((state) => ({
                    elderlyList: state.elderlyList.map((e) =>
                        e.id === elderlyId ? { ...e, ...data } : e
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

            getActiveAlertsByElderly: (elderlyId) => {
                return get().alerts.filter((a) => a.elderlyId === elderlyId && a.status === 'active');
            },

            getActiveAlertsByCaregiver: (caregiverId) => {
                const myElderlyIds = get().elderlyList.filter(e => e.caregiverId === caregiverId).map((e) => e.id);
                return get().alerts.filter((a) => myElderlyIds.includes(a.elderlyId) && a.status === 'active');
            },

            getAlertHistoryByElderly: (elderlyId) => {
                return get().alerts.filter((a) => a.elderlyId === elderlyId);
            },
        }),
        {
            name: 'elderly-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
