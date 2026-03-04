import { Robot, RobotInteractionLog, ReminderConfig, DeviceSettings } from '@/types';

/**
 * Mock Robot Service simulating backend interaction latency.
 * Provides independent architecture structure ready for real HTTP controllers.
 */
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class RobotService {
    async getRobots(caregiverId: string): Promise<Robot[]> {
        await delay(600);
        // Note: ID linkage would resolve to actual elderly context in DB.
        return [
            {
                id: 'rob-001',
                name: 'CareMate Alpha',
                roomId: 'room-1',
                assignedPatientId: 'elderly-1',
                status: 'online',
                batteryLevel: 85,
                lastHeartbeat: new Date().toISOString(),
                firmwareVersion: '1.4.2',
                cpuUsage: 12,
                memoryUsage: 45,
                settings: {
                    language: 'vi-VN',
                    volume: 80,
                    speechSpeed: 1.0,
                    alertTone: 'chime',
                    autoEscalationThreshold: 2
                }
            },
            {
                id: 'rob-002',
                name: 'CareMate Beta',
                roomId: 'room-2',
                assignedPatientId: 'elderly-2',
                status: 'needs_attention',
                batteryLevel: 15,
                lastHeartbeat: new Date(Date.now() - 3600000).toISOString(),
                firmwareVersion: '1.4.1',
                cpuUsage: 4,
                memoryUsage: 22,
                settings: {
                    language: 'en-US',
                    volume: 100,
                    speechSpeed: 0.8,
                    alertTone: 'beep',
                    autoEscalationThreshold: 3
                }
            }
        ];
    }

    async getRobotById(robotId: string): Promise<Robot | null> {
        await delay(400);
        const robots = await this.getRobots('mock-caregiver');
        return robots.find(r => r.id === robotId) || null;
    }

    async getRobotLogs(robotId: string): Promise<RobotInteractionLog[]> {
        await delay(700);
        return [
            {
                id: 'log-101',
                robotId,
                elderlyId: 'elderly-1',
                timestamp: new Date().toISOString(),
                reminderType: 'medication',
                robotMessage: 'Time to take your blood pressure medication, Alice.',
                elderlyResponse: 'Okay, I took it.',
                delayMinutes: 2,
                emotionScore: 8,
                status: 'completed',
                isPrivate: false
            },
            {
                id: 'log-102',
                robotId,
                elderlyId: 'elderly-1',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                reminderType: 'exercise',
                robotMessage: 'Would you like to do some light stretching?',
                elderlyResponse: 'Not right now, I am tired.',
                delayMinutes: 5,
                emotionScore: 4,
                status: 'ignored',
                isPrivate: false
            }
        ];
    }

    async createReminder(reminder: Omit<ReminderConfig, 'id' | 'createdAt'>): Promise<ReminderConfig> {
        await delay(500);
        return {
            ...reminder,
            id: `rem-${Date.now()}`,
            createdAt: new Date().toISOString()
        };
    }

    async updateReminder(id: string, updates: Partial<ReminderConfig>): Promise<ReminderConfig> {
        await delay(500);
        // In a real app we'd fetch the old one, patch it. Mocking returning partial merged structure
        return {
            id,
            ...updates
        } as ReminderConfig;
    }

    async deleteReminder(id: string): Promise<boolean> {
        await delay(400);
        return true;
    }

    async updateConfig(robotId: string, settings: Partial<DeviceSettings>): Promise<boolean> {
        await delay(600);
        return true;
    }
}

export const robotService = new RobotService();
