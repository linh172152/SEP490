import { RoleCapabilities, RoleType } from './types';

export const SETTINGS_CAPABILITIES: Record<RoleType, RoleCapabilities> = {
    admin: {
        canEditRiskThreshold: false,
        canManageCaregivers: true,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessNotifications: false,
        canAccessDataExport: false,
        canAccessProfessionalProfile: true,
    },
    caregiver: {
        canEditRiskThreshold: false,
        canManageCaregivers: false,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessNotifications: false,
        canAccessDataExport: false,
        canAccessProfessionalProfile: false,
    },
    family: {
        canEditRiskThreshold: false,
        canManageCaregivers: false,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessNotifications: false,
        canAccessDataExport: false,
        canAccessProfessionalProfile: false,
    },
    manager: {
        canEditRiskThreshold: false,
        canManageCaregivers: true,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessNotifications: false,
        canAccessDataExport: false,
        canAccessProfessionalProfile: true,
    }
};
