import { RoleCapabilities, RoleType } from './types';

export const SETTINGS_CAPABILITIES: Record<RoleType, RoleCapabilities> = {
    admin: {
        canEditRiskThreshold: false,
        canManageCaregivers: true,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessProfessionalProfile: false,
        canAccessNotifications: false,
        canAccessDataExport: false,
    },
    doctor: {
        canEditRiskThreshold: true,
        canManageCaregivers: true,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessProfessionalProfile: true,
        canAccessNotifications: true,
        canAccessDataExport: true,
    },
    caregiver: {
        canEditRiskThreshold: false,
        canManageCaregivers: false,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessProfessionalProfile: false,
        canAccessNotifications: true,
        canAccessDataExport: false,
    },
    family: {
        canEditRiskThreshold: false,
        canManageCaregivers: false,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessProfessionalProfile: false,
        canAccessNotifications: true,
        canAccessDataExport: false,
    }
};
