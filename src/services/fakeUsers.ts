import { Role, User } from '@/types';

export interface FakeUser extends User {
    password?: string; // Optional for simple mock scenarios, but required for demo auth
}

// Initial mock users representing the 4 key personas
export const fakeUsers: FakeUser[] = [
    {
        id: 'user-admin-001',
        name: 'Alex Admin',
        email: 'admin@carebot.com',
        password: 'password123',
        role: 'ADMIN',
    },
    {
        id: 'user-doctor-001',
        name: 'Dr. Sarah Jenkins',
        email: 'doctor@carebot.com',
        password: 'password123',
        role: 'DOCTOR',
    },
    {
        id: 'user-caregiver-001',
        name: 'Maria Rodriguez',
        email: 'caregiver@carebot.com',
        password: 'password123',
        role: 'CAREGIVER',
    },
    {
        id: 'user-family-001',
        name: 'John Smith',
        email: 'family@example.com',
        password: 'password123',
        role: 'FAMILY',
    },
    {
        id: 'user-caregiver-002',
        name: 'Sarah Specialist',
        email: 'sarah.c@carebot.com',
        password: 'password123',
        role: 'CAREGIVER',
    },
    {
        id: 'user-caregiver-003',
        name: 'David Nurse',
        email: 'david.n@carebot.com',
        password: 'password123',
        role: 'CAREGIVER',
    },
    {
        id: 'user-caregiver-004',
        name: 'Emily Care',
        email: 'emily.c@carebot.com',
        password: 'password123',
        role: 'CAREGIVER',
    },
    {
        id: 'user-caregiver-005',
        name: 'Michael Support',
        email: 'michael.s@carebot.com',
        password: 'password123',
        role: 'CAREGIVER',
    },
    {
        id: 'user-caregiver-006',
        name: 'Jessica Aide',
        email: 'jessica.a@carebot.com',
        password: 'password123',
        role: 'CAREGIVER',
    }
];
