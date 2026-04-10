import { accountService } from '@/services/api/accountService';
import { SettingsData, AuditLogEntry } from '../types';

export class SettingsService {
    async getSettings(userId: string | number): Promise<SettingsData> {
        const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        const account = await accountService.getAccountById(id);

        return {
            profile: {
                // Backend doesn't support images yet, using initials in UI
                avatar: "",
                fullName: account.fullName || account.FullName || "",
                email: account.email,
                phone: account.phone || "",
                professionalId: "", // Mocked as not in BE
                department: ""      // Mocked as not in BE
            },
            notifications: {
                criticalRisk: { email: true, sms: false, push: true },
                moodAnomaly: { email: true, sms: false, push: true },
                medicationNonCompliance: { email: true, sms: false, push: true },
                systemAlerts: { email: true, sms: false, push: true },
            },
            preferences: {
                theme: 'light',
                language: 'vi',
                timezone: 'Asia/Ho_Chi_Minh',
                dataRefreshInterval: '5m',
                tableDensity: 'comfortable',
            },
            security: {
                mfaEnabled: false,
            },
            riskManagement: {
                criticalThreshold: 80,
                alertSensitivity: 'medium',
                autoNotifyCaregiver: true,
            },
            sessions: []
        };
    }

    async updateProfile(userId: string | number, data: Partial<SettingsData['profile']>): Promise<void> {
        const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;

        const updatePayload: any = {
            deleted: false // Mandatory for backend unboxing
        };
        if (data.fullName) updatePayload.name = data.fullName;
        if (data.phone) updatePayload.phone = data.phone;
        // Email usually not updatable via this endpoint in backend

        await accountService.updateAccount(id, updatePayload);
    }

    async changePassword(userId: string | number, newPass: string): Promise<boolean> {
        const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        try {
            await accountService.updateAccount(id, { 
                password: newPass,
                deleted: false // Mandatory for backend unboxing
            });
            return true;
        } catch (error) {
            console.error("Failed to change password:", error);
            return false;
        }
    }

    async getAuditLogs(): Promise<AuditLogEntry[]> {
        // Placeholder as backend doesn't have a public audit log API for users yet
        return [];
    }

    async revokeSession(): Promise<void> {
        // Placeholder
    }
}

export const settingsService = new SettingsService();
