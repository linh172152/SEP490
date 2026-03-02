export type Role = 'ADMIN' | 'CAREGIVER' | 'DOCTOR' | 'FAMILY';

export interface User {
    id: string;
    name: string;
    role: Role;
    avatar?: string;
    email: string;
}

export interface HealthStatus {
    heartRate: number;
    bloodPressure: string;
    oxygenLevel: number;
    sleepHours: number;
    moodScore: number; // 0-100
    timestamp: string;
}

export interface Elderly {
    id: string;
    name: string;
    age: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    familyId: string;
    caregiverId?: string;
    condition: string;
    address: string;
    emergencyContact: string;
    avatar?: string;
    email: string; // Contact email for family
    healthStatus: HealthStatus;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Patient {
    id: string;
    name: string;
    age: number;
    condition: string;
    moodScore: number; // 0-100
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    lastMedication: string;
    avatar?: string;
    email: string;
}

export interface RobotStatus {
    id: string;
    battery: number;
    location: string;
    status: 'ONLINE' | 'OFFLINE' | 'CHARGING' | 'ASSISTING';
    assignedPatientId?: string;
    temperature: number;
    currentTask?: string;
    taskQueue: string[];
}

export interface CaregiverAssignment {
    id: string;
    caregiverId: string;
    elderlyId: string;
    assignedAt: string;
    status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
}

export interface Alert {
    id: string;
    patientId: string; // Mapping to Elderly.id
    type: 'MOOD_DROP' | 'MISSED_MEDICATION' | 'ROBOT_ERROR' | 'EMERGENCY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    timestamp: string;
    isRead: boolean;
    isResolved?: boolean;
}

export interface MoodLog {
    id: string;
    patientId: string;
    score: number;
    timestamp: string;
    notes?: string;
}
