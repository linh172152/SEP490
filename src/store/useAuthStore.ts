import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService, AccountResponse, RegisterDTO } from '@/services/api'; // Thêm RegisterDTO nếu chưa có
import { User } from '@/types';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (username: string, password: string) => Promise<void>;
    register: (data: RegisterDTO) => Promise<void>;
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

            login: async (username: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const loginResponse: AccountResponse = await authService.login({ username, password });
                    const token = loginResponse.token;

                    if (!token) {
                        throw new Error("Không nhận được token từ hệ thống");
                    }

                    authService.setToken(token);
                    
                    // Fetch full profile with role
                    const me: AccountResponse = await authService.getMe();
                    
                    // Cookie from me.role
                    if (typeof document !== 'undefined') {
                        document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
                        const rawRole = me.role || 'Caregiver';
                        const mappedRole = rawRole === 'Administrator' ? 'ADMIN' : 
                                           rawRole === 'Caregiver' ? 'CAREGIVER' : 
                                           rawRole === 'FamilyMember' ? 'FAMILY' : 
                                           rawRole === 'ElderlyUser' ? 'CAREGIVER' : 
                                           rawRole.toUpperCase();
                        document.cookie = `userRole=${mappedRole}; path=/; max-age=86400; SameSite=Lax`;
                    }
                    
                    const user: User = {
                        id: me.id.toString(),
                        name: me.FullName || loginResponse.FullName,
                        email: me.email,
                        phone: me.phone,
                        role: me.role || 'Administrator',
                        avatar: undefined,
                    };
                    
                    set({
                        user,
                        accessToken: token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || error.message || 'Đăng nhập thất bại',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            register: async (data: RegisterDTO) => {
                set({ isLoading: true, error: null });
                try {
                    await authService.register({
                        fullName: data.name,
                        email: data.email,
                        phone: data.phone || '',
                        password: data.password,
                        role: data.role,
                        gender: data.gender,
                    });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || error.message || 'Đăng ký thất bại',
                        isLoading: false,
                    });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: () => {
                authService.logout();
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