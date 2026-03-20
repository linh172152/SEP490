export type RoleType = 'doctor' | 'caregiver' | 'admin' | 'family';

export interface AlertNotificationConfig {
    email: boolean;
    sms: boolean;
    push: boolean;
}

export interface SettingsData {
    profile: {
        avatar: string;
        firstName: string;
        lastName: string;
        professionalId?: string; // Doctor specific
        department?: string; // Doctor specific
        email: string;
        phone: string;
    };
    notifications: {
        criticalRisk: AlertNotificationConfig;
        moodAnomaly: AlertNotificationConfig;
        medicationNonCompliance: AlertNotificationConfig;
        systemAlerts: AlertNotificationConfig;
    };
    preferences: {
        theme: 'light' | 'dark' | 'system';
        language: 'en' | 'vi';
        timezone: string;
        dataRefreshInterval: string; // e.g. '1m', '5m', '15m'
        tableDensity: 'compact' | 'comfortable';
    };
    security: {
        mfaEnabled: boolean;
    };
    riskManagement: {
        criticalThreshold: number;
        alertSensitivity: 'low' | 'medium' | 'high';
        autoNotifyCaregiver: boolean;
    };
    sessions: ActiveSession[];
}

export interface ActiveSession {
    id: string;
    deviceName: string;
    ipAddress: string;
    lastActivity: string;
    isCurrent: boolean;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: string;
    module: string;
    ipAddress: string;
    status: 'success' | 'failure';
}

export interface RoleCapabilities {
    canEditRiskThreshold: boolean;
    canManageCaregivers: boolean;
    canAccessAuditLogs: boolean;
    canAccessRoleAccess: boolean;
    canAccessProfessionalProfile: boolean;
}
