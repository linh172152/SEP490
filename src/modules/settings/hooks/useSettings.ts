import { useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services/settings.service';
import { SettingsData, RoleType, RoleCapabilities, AuditLogEntry } from '../types';
import { SETTINGS_CAPABILITIES } from '../constants';
import { toast } from 'sonner';

interface UseSettingsReturn {
    isLoading: boolean;
    isSaving: boolean;
    settings: SettingsData | null;
    capabilities: RoleCapabilities;
    auditLogs: AuditLogEntry[];

    // Updaters
    updateProfile: (data: Partial<SettingsData['profile']>) => Promise<void>;
    updateNotifications: (data: Partial<SettingsData['notifications']>) => Promise<void>;
    updatePreferences: (data: Partial<SettingsData['preferences']>) => Promise<void>;
    updateSecurity: (data: Partial<SettingsData['security']>) => Promise<void>;
    updateRiskManagement: (data: Partial<SettingsData['riskManagement']>) => Promise<void>;
    revokeSession: (sessionId: string) => Promise<void>;
    fetchAuditLogs: () => Promise<void>;
}

export const useSettings = (role: RoleType): UseSettingsReturn => {
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const capabilities = SETTINGS_CAPABILITIES[role];

    const fetchSettings = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await settingsService.getSettings();
            setSettings(data);
        } catch (error) {
            toast.error('Failed to load settings');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const fetchAuditLogs = useCallback(async () => {
        if (!capabilities.canAccessAuditLogs) return;
        try {
            const logs = await settingsService.getAuditLogs();
            setAuditLogs(logs);
        } catch (error) {
            toast.error('Failed to load audit logs');
        }
    }, [capabilities.canAccessAuditLogs]);

    const updateProfile = async (data: Partial<SettingsData['profile']>) => {
        if (!settings) return;
        try {
            setIsSaving(true);
            await settingsService.updateProfile(data);
            setSettings(prev => prev ? { ...prev, profile: { ...prev.profile, ...data } } : prev);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    const updateNotifications = async (data: Partial<SettingsData['notifications']>) => {
        if (!settings) return;
        try {
            setIsSaving(true);
            await settingsService.updateNotifications(data);
            setSettings(prev => prev ? { ...prev, notifications: { ...prev.notifications, ...data } } : prev);
            toast.success('Notification preferences updated');
        } catch (error) {
            toast.error('Failed to update notifications');
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    const updatePreferences = async (data: Partial<SettingsData['preferences']>) => {
        if (!settings) return;
        try {
            setIsSaving(true);
            await settingsService.updatePreferences(data);
            setSettings(prev => prev ? { ...prev, preferences: { ...prev.preferences, ...data } } : prev);
            toast.success('Preferences saved');
        } catch (error) {
            toast.error('Failed to update preferences');
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    const updateSecurity = async (data: Partial<SettingsData['security']>) => {
        if (!settings) return;
        try {
            setIsSaving(true);
            await settingsService.updateSecurity(data);
            setSettings(prev => prev ? { ...prev, security: { ...prev.security, ...data } } : prev);
            toast.success('Security settings updated');
        } catch (error) {
            toast.error('Failed to update security');
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    const updateRiskManagement = async (data: Partial<SettingsData['riskManagement']>) => {
        if (!settings || !capabilities.canEditRiskThreshold) return;
        try {
            setIsSaving(true);
            await settingsService.updateRiskManagement(data);
            setSettings(prev => prev ? { ...prev, riskManagement: { ...prev.riskManagement, ...data } } : prev);
            toast.success('Risk management settings updated');
        } catch (error) {
            toast.error('Failed to update risk management');
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    const revokeSession = async (sessionId: string) => {
        if (!settings) return;
        try {
            setIsSaving(true);
            await settingsService.revokeSession(sessionId);
            setSettings(prev => prev ? {
                ...prev,
                sessions: prev.sessions.filter(s => s.id !== sessionId)
            } : prev);
            toast.success('Session revoked successfully');
        } catch (error) {
            toast.error('Failed to revoke session');
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        isLoading,
        isSaving,
        settings,
        capabilities,
        auditLogs,
        updateProfile,
        updateNotifications,
        updatePreferences,
        updateSecurity,
        updateRiskManagement,
        revokeSession,
        fetchAuditLogs
    };
};
