import { RoleCapabilities, RoleType } from './types';

export const SETTINGS_CAPABILITIES: Record<RoleType, RoleCapabilities> = {
    admin: {
        canEditRiskThreshold: true,
        canManageCaregivers: true,
        canAccessAuditLogs: true,
        canAccessRoleAccess: true,
        canAccessProfessionalProfile: false,
        canUploadMedia: false,
    },
    doctor: {
        canEditRiskThreshold: true,
        canManageCaregivers: true,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessProfessionalProfile: true,
        canUploadMedia: false,
    },
    caregiver: {
        canEditRiskThreshold: false,
        canManageCaregivers: false,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessProfessionalProfile: false,
        canUploadMedia: true,
    },
    family: {
        canEditRiskThreshold: false,
        canManageCaregivers: false,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessProfessionalProfile: false,
        canUploadMedia: false,
    }
};
