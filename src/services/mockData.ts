import { Room, UserPackageResponse, ElderlyProfileResponse, AccountResponse } from './api/types';

// Mock Rooms Data
export const mockRooms: Room[] = [
  {
    id: 1,
    roomName: 'Room A',
    name: 'Room A',
    description: 'Ground floor room for elderly care',
    capacity: 5,
    floor: '1',
    elderlies: [
      { id: 1, name: 'Alice Smith' },
      { id: 2, name: 'Robert Johnson' },
      { id: 3, name: 'Maria Garcia' }
    ],
    caregivers: [
      { id: 2, name: 'Maria Rodriguez' }
    ],
    robot: null
  },
  {
    id: 2,
    roomName: 'Room B',
    name: 'Room B',
    description: 'Second floor room',
    capacity: 4,
    floor: '2',
    elderlies: [
      { id: 4, name: 'John Wilson' },
      { id: 5, name: 'Eleanor Davis' }
    ],
    caregivers: [
      { id: 3, name: 'Sarah Specialist' }
    ],
    robot: null
  },
  {
    id: 3,
    roomName: 'Room C',
    name: 'Room C',
    description: 'Third floor room',
    capacity: 6,
    floor: '3',
    elderlies: [],
    caregivers: [],
    robot: null
  }
];

// Mock User Packages (FM purchased packages for EL)
export const mockUserPackages: UserPackageResponse[] = [
  {
    id: 1,
    accountId: 1, // FM account
    servicePackageId: 1, // Basic package
    assignedAt: '2024-01-15T00:00:00Z',
    expiredAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 2,
    accountId: 1,
    servicePackageId: 2, // Premium package
    assignedAt: '2024-01-20T00:00:00Z',
    expiredAt: '2024-02-20T00:00:00Z'
  }
];

// Mock Elderly Profiles with room assignments
export const mockElderlyProfiles: (ElderlyProfileResponse & { roomId?: number | null; packageId?: number | null })[] = [
  {
    id: 1,
    accountId: 1,
    name: 'Alice Smith',
    dateOfBirth: '1952-03-15',
    healthNotes: 'Mild arthritis, needs assistance with mobility',
    preferredLanguage: 'English',
    speakingSpeed: 'Slow',
    fullName: 'Alice Smith',
    deleted: false,
    roomId: 1, // Assigned to Room A
    packageId: 1 // Basic package
  },
  {
    id: 2,
    accountId: 1,
    name: 'Robert Johnson',
    dateOfBirth: '1944-07-22',
    healthNotes: 'Hypertension, regular medication',
    preferredLanguage: 'English',
    speakingSpeed: 'Normal',
    fullName: 'Robert Johnson',
    deleted: false,
    roomId: 1, // Assigned to Room A
    packageId: 2 // Premium package
  },
  {
    id: 3,
    accountId: 1,
    name: 'Maria Garcia',
    dateOfBirth: '1948-11-08',
    healthNotes: 'Diabetes management',
    preferredLanguage: 'Spanish',
    speakingSpeed: 'Slow',
    fullName: 'Maria Garcia',
    deleted: false,
    roomId: 2, // Assigned to Room B
    packageId: null // No package
  },
  {
    id: 4,
    accountId: 1,
    name: 'John Wilson',
    dateOfBirth: '1950-05-30',
    healthNotes: 'Early stage dementia',
    preferredLanguage: 'English',
    speakingSpeed: 'Very Slow',
    fullName: 'John Wilson',
    deleted: false,
    roomId: null, // Unassigned
    packageId: null // No package
  },
  {
    id: 5,
    accountId: 1,
    name: 'Eleanor Davis',
    dateOfBirth: '1942-12-12',
    healthNotes: 'Post-surgery recovery',
    preferredLanguage: 'English',
    speakingSpeed: 'Normal',
    fullName: 'Eleanor Davis',
    deleted: false,
    roomId: null, // Unassigned
    packageId: null // No package
  }
];

// Mock Caregivers with room assignments
export const mockCaregivers: (AccountResponse & { roomId?: number | null })[] = [
  {
    id: 2,
    fullName: 'Maria Rodriguez',
    gender: 'Female',
    email: 'maria.r@carebot.com',
    phone: '+1234567890',
    token: '',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    role: 'CAREGIVER',
    roomId: 1 // Assigned to Room A
  },
  {
    id: 3,
    fullName: 'Sarah Specialist',
    gender: 'Female',
    email: 'sarah.s@carebot.com',
    phone: '+1234567891',
    token: '',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    role: 'CAREGIVER',
    roomId: 2 // Assigned to Room B
  },
  {
    id: 4,
    fullName: 'David Nurse',
    gender: 'Male',
    email: 'david.n@carebot.com',
    phone: '+1234567892',
    token: '',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    role: 'CAREGIVER',
    roomId: null // Unassigned
  },
  {
    id: 5,
    fullName: 'Emily Care',
    gender: 'Female',
    email: 'emily.c@carebot.com',
    phone: '+1234567893',
    token: '',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    role: 'CAREGIVER',
    roomId: null // Unassigned
  }
];

// Mock Service Packages (for reference)
export const mockServicePackages = [
  {
    id: 1,
    name: 'Basic Care',
    description: 'Basic elderly care package',
    level: 'Basic',
    price: 50,
    active: true
  },
  {
    id: 2,
    name: 'Premium Care',
    description: 'Premium elderly care with additional services',
    level: 'Premium',
    price: 100,
    active: true
  },
  {
    id: 3,
    name: 'VIP Care',
    description: 'VIP elderly care with full support',
    level: 'VIP',
    price: 200,
    active: true
  }
];