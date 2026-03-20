import { Patient, RobotStatus, Alert, User, MoodLog, ClinicalNote, ActivityEntry } from '@/types';

export const mockUsers: User[] = [
    { id: 'user-doctor-001', name: 'Dr. Sarah Jenkins', role: 'DOCTOR', email: 'doctor@carebot.com' },
    { id: 'user-caregiver-001', name: 'Maria Rodriguez', role: 'CAREGIVER', email: 'caregiver@carebot.com' },
    { id: 'user-admin-001', name: 'Alex Admin', role: 'ADMIN', email: 'admin@carebot.com' },
    { id: 'user-family-001', name: 'John Smith', role: 'FAMILY', email: 'family@example.com' },
    { id: 'user-caregiver-002', name: 'Sarah Specialist', role: 'CAREGIVER', email: 'sarah.c@carebot.com' },
    { id: 'user-caregiver-003', name: 'David Nurse', role: 'CAREGIVER', email: 'david.n@carebot.com' },
    { id: 'user-caregiver-004', name: 'Emily Care', role: 'CAREGIVER', email: 'emily.c@carebot.com' },
    { id: 'user-caregiver-005', name: 'Michael Support', role: 'CAREGIVER', email: 'michael.s@carebot.com' },
    { id: 'user-caregiver-006', name: 'Jessica Aide', role: 'CAREGIVER', email: 'jessica.a@carebot.com' },
];

export const mockPatients: Patient[] = [
    {
        id: 'p1',
        name: 'Alice Smith',
        age: 72,
        condition: 'Mild Depression',
        moodScore: 65,
        riskLevel: 'LOW',
        lastMedication: '2025-10-10T08:00:00Z',
        email: 'alice.s@example.com'
    },
    {
        id: 'p2',
        name: 'Robert Johnson',
        age: 80,
        condition: 'Severe Anxiety',
        moodScore: 40,
        riskLevel: 'HIGH',
        lastMedication: '2025-10-10T09:00:00Z',
        email: 'robert.j@example.com'
    },
];

export const mockRobots: RobotStatus[] = [
    {
        id: 'r1',
        battery: 85,
        location: 'Room 201',
        status: 'ONLINE',
        assignedPatientId: 'p1',
        temperature: 36.5,
        currentTask: 'Monitoring Alice Smith',
        taskQueue: ['Scheduled Check-up at 9:00 PM', 'Medication Reminder']
    },
    {
        id: 'r2',
        battery: 18,
        location: 'Charging Bay',
        status: 'CHARGING',
        temperature: 38.2,
        currentTask: 'Charging',
        taskQueue: ['Move to Ward B', 'Battery Calibration']
    },
    {
        id: 'r3',
        battery: 95,
        location: 'Room 205',
        status: 'ASSISTING',
        assignedPatientId: 'p2',
        temperature: 37.0,
        currentTask: 'Assisting Robert Johnson',
        taskQueue: ['Deliver water', 'Fetch blanket']
    },
];

export const mockAlerts: Alert[] = [
    {
        id: 'a1',
        elderlyId: 'p2',
        type: 'mood_drop',
        severity: 'high',
        message: 'Sudden drop in mood detected for Robert Johnson.',
        status: 'active',
        createdAt: new Date().toISOString()
    },
    {
        id: 'a2',
        elderlyId: 'p1',
        type: 'heart_rate_abnormal',
        severity: 'medium',
        message: 'Alice Smith heart rate is slightly elevated.',
        status: 'resolved',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        resolvedAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
        id: 'a3',
        elderlyId: 'p2',
        type: 'emergency',
        severity: 'critical',
        message: 'High heart rate detected for Robert Johnson.',
        status: 'active',
        createdAt: new Date(Date.now() - 7200000).toISOString()
    },
];

export const mockMoodHistory: MoodLog[] = [
    // Alice (p1)
    { id: 'm0-1', patientId: 'p1', score: 60, timestamp: '2025-10-05T08:00:00Z' },
    { id: 'm0-2', patientId: 'p1', score: 62, timestamp: '2025-10-06T08:00:00Z' },
    { id: 'm0-3', patientId: 'p1', score: 65, timestamp: '2025-10-07T08:00:00Z' },
    { id: 'm0-4', patientId: 'p1', score: 68, timestamp: '2025-10-08T08:00:00Z' },
    { id: 'm0-5', patientId: 'p1', score: 65, timestamp: '2025-10-09T08:00:00Z' },
    // Robert (p2)
    { id: 'm1', patientId: 'p2', score: 60, timestamp: '2025-10-05T10:00:00Z' },
    { id: 'm2', patientId: 'p2', score: 55, timestamp: '2025-10-06T10:00:00Z' },
    { id: 'm3', patientId: 'p2', score: 50, timestamp: '2025-10-07T10:00:00Z' },
    { id: 'm4', patientId: 'p2', score: 45, timestamp: '2025-10-08T10:00:00Z' },
    { id: 'm5', patientId: 'p2', score: 40, timestamp: '2025-10-09T10:00:00Z' },
];

export const mockClinicalNotes: ClinicalNote[] = [
    {
        id: 'n1',
        elderlyId: 'p2',
        doctorId: '1',
        content: 'Patient showing increased signs of agitation in the evenings. Recommend adjusting evening robot escort frequency.',
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 'n2',
        elderlyId: 'p2',
        doctorId: '1',
        content: 'Cognitive assessment shows slight decline in short-term memory recall. Initiating memory games via CareBot.',
        createdAt: new Date(Date.now() - 43200000).toISOString()
    }
];

export const mockActivityLogs: ActivityEntry[] = [
    { id: 'act1', type: 'meal', message: 'Finished breakfast (Oatmeal & Fruit)', timestamp: new Date(Date.now() - 14400000).toISOString() },
    { id: 'act2', type: 'walk', message: 'Garden walk completed (15 mins)', timestamp: new Date(Date.now() - 10800000).toISOString() },
    { id: 'act3', type: 'sleep', message: 'Nap detected (45 mins)', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 'act4', type: 'medication', message: 'Morning medication administered', timestamp: new Date(Date.now() - 18000000).toISOString() },
];
