export type Role = 'ADMIN' | 'CAREGIVER' | 'DOCTOR' | 'FAMILY';

export interface User {
    id: string;
    name: string;
    role: Role;
    avatar?: string;
    email: string;
}

export interface Patient {
    id: string;
    name: string;
    age: number;
    condition: string;
    moodScore: number; // 0-100
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    lastMedication: string;
}

export interface RobotStatus {
    id: string;
    battery: number;
    location: string;
    status: 'ONLINE' | 'OFFLINE' | 'CHARGING' | 'ASSISTING';
    assignedPatientId?: string;
}

export interface MoodLog {
    id: string;
    patientId: string;
    score: number;
    timestamp: string;
    notes?: string;
}

export interface Alert {
    id: string;
    patientId: string;
    type: 'MOOD_DROP' | 'MISSED_MEDICATION' | 'ROBOT_ERROR' | 'EMERGENCY';
    message: string;
    timestamp: string;
    isRead: boolean;
}
