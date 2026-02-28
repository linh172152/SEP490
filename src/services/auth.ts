import { Role } from '@/types';
import { mockUsers } from './mock';

export interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        name: string;
        role: Role;
    };
}

/**
 * Simulates a backend authentication request.
 * Resolves with a generated token and user object if email matches a mock user.
 * Rejects if credentials are not found.
 */
export const login = async (email: string, password?: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.email === email);

            // Since it's a mock, we assume any password is valid if the email exists.
            // In a real application, we would validate the password as well.
            if (user) {
                resolve({
                    accessToken: `mock-jwt-token-${user.id}-${Date.now()}`,
                    user: {
                        id: user.id,
                        name: user.name,
                        role: user.role,
                    },
                });
            } else {
                reject(new Error('Invalid credentials'));
            }
        }, Math.floor(Math.random() * 300) + 500); // 500-800ms delay
    });
};
