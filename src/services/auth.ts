import { Role, User } from '@/types';
import { fakeUsers, FakeUser } from './fakeUsers';

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface RegisterDTO {
    name: string;
    email: string;
    password?: string;
    role: Role;
}

/**
 * Simulates a backend login request.
 * Resolves with a generated token and user object if email/password matches a mock user.
 * Rejects if credentials are not found.
 */
export const login = async (email: string, password?: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = fakeUsers.find(u => u.email === email && u.password === password);

            if (user) {
                // Return User without exposing password
                const { password: _, ...userWithoutPassword } = user;

                resolve({
                    accessToken: `mock-jwt-token-${user.id}-${Date.now()}`,
                    user: userWithoutPassword,
                });
            } else {
                reject(new Error('Invalid email or password'));
            }
        }, Math.floor(Math.random() * 300) + 500); // 500-800ms delay
    });
};

/**
 * Simulates a backend register request.
 * Resolves with a generated token and new user object if email is unique.
 * Rejects if email already exists.
 */
export const register = async (data: RegisterDTO): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const emailExists = fakeUsers.some(u => u.email === data.email);

            if (emailExists) {
                reject(new Error('Email is already registered'));
                return;
            }

            const newUser: FakeUser = {
                id: `user-new-${Date.now()}`,
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
            };

            // Mutate fakeUsers to simulate DB insert
            fakeUsers.push(newUser);

            const { password: _, ...userWithoutPassword } = newUser;

            resolve({
                accessToken: `mock-jwt-token-${newUser.id}-${Date.now()}`,
                user: userWithoutPassword,
            });
        }, Math.floor(Math.random() * 300) + 500); // 500-800ms delay
    });
};
