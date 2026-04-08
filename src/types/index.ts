export type Role = 'ELDERLY' | 'CAREGIVER' | 'MANAGER' | 'ADMIN' | 'ADMINISTRATOR' | 'FAMILYMEMBER' | string;

export interface User {
    id: string;
    name: string;
    role: Role | string;
    avatar?: string;
    email: string;
    phone?: string;
}

export interface HealthStatus {
    heartRate: number;
    bloodPressure: string;
    oxygenLevel: number;
    sleepHours: number;
    moodScore: number; // 0-100
    cognitiveScore?: number; // 0-100 (New for Phase F7)
    timestamp: string;
}

export interface ActivityEntry {
    id: string;
    type: 'meal' | 'sleep' | 'walk' | 'medication' | 'exercise' | 'other';
    message: string;
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
    activityLog?: ActivityEntry[]; // New for Phase F7
    cognitiveHistory?: { timestamp: string, score: number }[]; // New for Phase F7
}

export interface ClinicalNote {
    id: string;
    elderlyId: string;
    managerId: string;
    content: string;
    createdAt: string;
}



export interface RobotStatus {
    id: string;
    battery: number;
    location: string;
    status: 'ONLINE' | 'OFFLINE' | 'CHARGING' | 'ASSISTING';
    assignedElderlyId?: string;
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

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'resolved';

export interface Alert {
    id: string;
    elderlyId: string; // Mapping to Elderly.id
    type: 'mood_drop' | 'heart_rate_abnormal' | 'emergency';
    message: string;
    severity: AlertSeverity;
    status: AlertStatus;
    createdAt: string;
    resolvedAt?: string;
}

export interface MoodLog {
    id: string;
    elderlyId: string;
    score: number;
    timestamp: string;
    notes?: string;
}
