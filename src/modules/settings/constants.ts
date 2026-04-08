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
        canEditRiskThreshold: false,
        canManageCaregivers: true,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessProfessionalProfile: true,
        canAccessNotifications: false,
        canAccessDataExport: true,
    },
    caregiver: {
        canEditRiskThreshold: false,
        canManageCaregivers: false,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessProfessionalProfile: false,
        canAccessNotifications: false,
        canAccessDataExport: false,
    },
    family: {
        canEditRiskThreshold: false,
        canManageCaregivers: false,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessProfessionalProfile: false,
        canAccessNotifications: false,
        canAccessDataExport: false,
    },
    manager: {
        canEditRiskThreshold: false,
        canManageCaregivers: true,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessProfessionalProfile: false,
        canAccessNotifications: false,
        canAccessDataExport: true,
    }
};
