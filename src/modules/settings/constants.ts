import { RoleCapabilities, RoleType } from './types';

export const SETTINGS_CAPABILITIES: Record<RoleType, RoleCapabilities> = {
    admin: {
        canEditRiskThreshold: true,
        canManageCaregivers: true,
        canAccessAuditLogs: true,
        canAccessRoleAccess: true,
        canAccessProfessionalProfile: false,
        canUploadMedia: false,
        canConfigureRobot: true,
    },
    doctor: {
        canEditRiskThreshold: true,
        canManageCaregivers: true,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessProfessionalProfile: true,
        canUploadMedia: false,
        canConfigureRobot: false,
    },
    caregiver: {
        canEditRiskThreshold: false,
        canManageCaregivers: false,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessProfessionalProfile: false,
        canUploadMedia: true,
        canConfigureRobot: true,
    },
    family: {
        canEditRiskThreshold: false,
        canManageCaregivers: false,
        canAccessAuditLogs: false,
        canAccessRoleAccess: false,
        canAccessProfessionalProfile: false,
        canUploadMedia: false,
        canConfigureRobot: false,
    }
};
