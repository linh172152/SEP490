import { create } from 'zustand';
import { Robot, RobotInteractionLog, ReminderConfig, DeviceSettings } from '@/types';
import { robotService } from '@/modules/robots/services/robot.service';

interface RobotState {
    robots: Robot[];
    activeRobotLogs: RobotInteractionLog[];
    activeReminders: ReminderConfig[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchRobots: (caregiverId: string) => Promise<void>;
    fetchRobotLogs: (robotId: string) => Promise<void>;

    // Mocks local reminder state
    addReminder: (reminder: Omit<ReminderConfig, 'id' | 'createdAt'>) => Promise<void>;
    removeReminder: (id: string) => Promise<void>;

    // Generic sync
    updateDeviceConfig: (robotId: string, settings: Partial<DeviceSettings>) => Promise<void>;

    // Selectors
    getRobotById: (id: string) => Robot | undefined;
}

export const useRobotStore = create<RobotState>()((set, get) => ({
    robots: [],
    activeRobotLogs: [],
    activeReminders: [
        {
            id: 'rem-init-1',
            robotId: 'rob-001',
            type: 'medication',
            time: '08:00',
            recurrence: 'daily',
            message: 'Time for your morning heart pills.',
            urgencyLevel: 'high',
            active: true,
            createdAt: new Date().toISOString()
        }
    ],
    isLoading: false,
    error: null,

    fetchRobots: async (caregiverId) => {
        set({ isLoading: true, error: null });
        try {
            const robots = await robotService.getRobots(caregiverId);
            set({ robots, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    fetchRobotLogs: async (robotId) => {
        set({ isLoading: true, error: null });
        try {
            const logs = await robotService.getRobotLogs(robotId);
            set({ activeRobotLogs: logs, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    addReminder: async (reminder) => {
        try {
            const newRem = await robotService.createReminder(reminder);
            set(state => ({ activeReminders: [...state.activeReminders, newRem] }));
        } catch (err) {
            console.error("Failed to add reminder");
        }
    },

    removeReminder: async (id) => {
        try {
            await robotService.deleteReminder(id);
            set(state => ({ activeReminders: state.activeReminders.filter(r => r.id !== id) }));
        } catch (err) {
            console.error("Failed to delete reminder");
        }
    },

    updateDeviceConfig: async (robotId, settings) => {
        try {
            await robotService.updateConfig(robotId, settings);
            set(state => ({
                robots: state.robots.map(r =>
                    r.id === robotId ? { ...r, settings: { ...r.settings, ...settings } } : r
                )
            }));
        } catch (err) {
            console.error("Failed to update config");
        }
    },

    getRobotById: (id) => {
        return get().robots.find(r => r.id === id);
    }
}));
