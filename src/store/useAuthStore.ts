import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthResponse, login as mockLogin } from '@/services/auth';
import { Role } from '@/types';

interface AuthUser {
    id: string;
    name: string;
    role: Role;
}

interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password?: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password?: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response: AuthResponse = await mockLogin(email, password);
                    // Sync with cookies to allow Next.js Edge Middleware to read auth state
                    if (typeof document !== 'undefined') {
                        document.cookie = `accessToken=${response.accessToken}; path=/; max-age=86400; SameSite=Lax`;
                        document.cookie = `userRole=${response.user.role}; path=/; max-age=86400; SameSite=Lax`;
                    }
                    set({
                        user: response.user,
                        accessToken: response.accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    set({
                        error: error.message || 'Login failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            logout: () => {
                // Clear cookies on logout
                if (typeof document !== 'undefined') {
                    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                }
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            clearError: () => {
                set({ error: null });
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
