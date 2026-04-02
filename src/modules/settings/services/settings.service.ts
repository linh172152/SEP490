import { SettingsData, AuditLogEntry, ActiveSession } from '../types';

// Mock Data
const MOCK_SESSIONS: ActiveSession[] = [
    { id: 'sess-1', deviceName: 'MacBook Pro - Chrome', ipAddress: '192.168.1.100', lastActivity: new Date().toISOString(), isCurrent: true },
    { id: 'sess-2', deviceName: 'iPhone 15 Pro - Safari', ipAddress: '172.20.10.2', lastActivity: new Date(Date.now() - 86400000).toISOString(), isCurrent: false },
];

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { id: 'log-1', timestamp: new Date().toISOString(), userId: 'user-1', userName: 'Admin User', action: 'Update Risk Thresholds', module: 'Settings - Risk', ipAddress: '192.168.1.100', status: 'success' },
    { id: 'log-2', timestamp: new Date(Date.now() - 3600000).toISOString(), userId: 'user-2', userName: 'Doctor Smith', action: 'Export Patient Data', module: 'Settings - Export', ipAddress: '10.0.0.50', status: 'success' },
    { id: 'log-3', timestamp: new Date(Date.now() - 86400000).toISOString(), userId: 'user-3', userName: 'Caregiver Jane', action: 'Failed Login Attempt', module: 'Auth', ipAddress: '192.168.1.105', status: 'failure' },
];

const INITIAL_SETTINGS: SettingsData = {
    profile: {
        avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=John',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 000-0000',
        professionalId: 'MD-12345',
        department: 'Geriatrics'
    },
    notifications: {
        criticalRisk: { email: true, sms: true, push: true },
        moodAnomaly: { email: true, sms: false, push: true },
        medicationNonCompliance: { email: true, sms: true, push: false },
        systemAlerts: { email: true, sms: false, push: false },
    },
    preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        dataRefreshInterval: '5m',
        tableDensity: 'comfortable',
    },
    security: {
        mfaEnabled: true,
    },
    riskManagement: {
        criticalThreshold: 85,
        alertSensitivity: 'high',
        autoNotifyCaregiver: true,
    },
    sessions: [...MOCK_SESSIONS]
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class SettingsService {
    private settings: SettingsData = { ...INITIAL_SETTINGS };
    private auditLogs: AuditLogEntry[] = [...MOCK_AUDIT_LOGS];

    async getSettings(): Promise<SettingsData> {
        await delay(600);
        return JSON.parse(JSON.stringify(this.settings));
    }

    async updateProfile(data: Partial<SettingsData['profile']>): Promise<void> {
        await delay(800);
        this.settings.profile = { ...this.settings.profile, ...data };
    }

    async updateNotifications(data: Partial<SettingsData['notifications']>): Promise<void> {
        await delay(600);
        this.settings.notifications = { ...this.settings.notifications, ...data };
    }

    async updatePreferences(data: Partial<SettingsData['preferences']>): Promise<void> {
        await delay(500);
        this.settings.preferences = { ...this.settings.preferences, ...data };
    }

    async updateSecurity(data: Partial<SettingsData['security']>): Promise<void> {
        await delay(800);
        this.settings.security = { ...this.settings.security, ...data };
    }

    async updateRiskManagement(data: Partial<SettingsData['riskManagement']>): Promise<void> {
        await delay(700);
        this.settings.riskManagement = { ...this.settings.riskManagement, ...data };
    }

    async getAuditLogs(): Promise<AuditLogEntry[]> {
        await delay(1000);
        return [...this.auditLogs];
    }

    async revokeSession(sessionId: string): Promise<void> {
        await delay(500);
        this.settings.sessions = this.settings.sessions.filter(s => s.id !== sessionId);
    }

    async changePassword(current: string, newPass: string): Promise<boolean> {
        await delay(1200);
        // Mock validation
        return current !== newPass && newPass.length >= 8;
    }
}

// Export singleton instance
export const settingsService = new SettingsService();
