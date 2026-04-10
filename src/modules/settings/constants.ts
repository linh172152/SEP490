import { RoleCapabilities, RoleType } from './types';

export const SETTINGS_CAPABILITIES: Record<RoleType, RoleCapabilities> = {
    admin: {
        canEditRiskThreshold: false,
        canManageCaregivers: true,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessNotifications: false,
        canAccessDataExport: false,
    },
    caregiver: {
        canEditRiskThreshold: false,
        canManageCaregivers: false,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessNotifications: false,
        canAccessDataExport: false,
    },
    family: {
        canEditRiskThreshold: false,
        canManageCaregivers: false,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessNotifications: false,
        canAccessDataExport: false,
    },
    manager: {
        canEditRiskThreshold: false,
        canManageCaregivers: true,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessNotifications: false,
        canAccessDataExport: false,
    }
};
