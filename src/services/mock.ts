import { Patient, RobotStatus, Alert, User, MoodLog } from '@/types';

export const mockUsers: User[] = [
    { id: '1', name: 'Dr. Sarah Jenkins', role: 'DOCTOR', email: 'sarah@carebot.test' },
    { id: '2', name: 'Mark Therapist', role: 'CAREGIVER', email: 'mark@carebot.test' },
    { id: '3', name: 'Admin User', role: 'ADMIN', email: 'admin@carebot.test' },
    { id: '4', name: 'John Doe', role: 'FAMILY', email: 'john@family.test' },
];

export const mockPatients: Patient[] = [
    { id: 'p1', name: 'Alice Smith', age: 72, condition: 'Mild Depression', moodScore: 65, riskLevel: 'LOW', lastMedication: '2025-10-10T08:00:00Z' },
    { id: 'p2', name: 'Robert Johnson', age: 80, condition: 'Severe Anxiety', moodScore: 40, riskLevel: 'HIGH', lastMedication: '2025-10-10T09:00:00Z' },
];

export const mockRobots: RobotStatus[] = [
    { id: 'r1', battery: 85, location: 'Room 201', status: 'ONLINE', assignedPatientId: 'p1' },
    { id: 'r2', battery: 20, location: 'Charging Bay', status: 'CHARGING' },
    { id: 'r3', battery: 95, location: 'Room 205', status: 'ASSISTING', assignedPatientId: 'p2' },
];

export const mockAlerts: Alert[] = [
    { id: 'a1', patientId: 'p2', type: 'MOOD_DROP', message: 'Sudden drop in mood detected for Robert Johnson.', timestamp: new Date().toISOString(), isRead: false },
    { id: 'a2', patientId: 'p1', type: 'MISSED_MEDICATION', message: 'Alice Smith missed 8:00 AM medication.', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: true },
];

export const mockMoodHistory: MoodLog[] = [
    { id: 'm1', patientId: 'p2', score: 60, timestamp: '2025-10-05T10:00:00Z' },
    { id: 'm2', patientId: 'p2', score: 55, timestamp: '2025-10-06T10:00:00Z' },
    { id: 'm3', patientId: 'p2', score: 50, timestamp: '2025-10-07T10:00:00Z' },
    { id: 'm4', patientId: 'p2', score: 45, timestamp: '2025-10-08T10:00:00Z' },
    { id: 'm5', patientId: 'p2', score: 40, timestamp: '2025-10-09T10:00:00Z' },
];
