import { accountService } from '@/services/api/accountService';
import { SettingsData, AuditLogEntry } from '../types';

export class SettingsService {
    async getSettings(userId: string | number): Promise<SettingsData> {
        const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        const account = await accountService.getAccountById(id);

        // Split fullName into first and last name for the UI
        const names = (account.fullName || account.FullName || "").split(' ');
        const firstName = names[0] || "";
        const lastName = names.slice(1).join(' ') || "";

        return {
            profile: {
                // Use Dicebear for avatars since BE doesn't store them yet
                avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(account.fullName || account.email)}`,
                firstName,
                lastName,
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

        // Combine names back for Backend
        const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ');

        const updatePayload: any = {};
        if (fullName) updatePayload.name = fullName;
        if (data.phone) updatePayload.phone = data.phone;
        // Email usually not updatable via this endpoint in backend

        await accountService.updateAccount(id, updatePayload);
    }

    async changePassword(userId: string | number, newPass: string): Promise<boolean> {
        const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        try {
            await accountService.updateAccount(id, { password: newPass });
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
