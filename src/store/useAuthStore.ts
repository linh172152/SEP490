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

                    // BE hiện tại không có endpoint GET /api/auth/me.
                    // Vì vậy dùng trực tiếp dữ liệu trả về từ POST /api/login để set role/cookie.
                    // Lưu ý: AccountResponse trong BE có thể không trả về `role`, nên ở FE có fallback.
                    const loginResponseAny = loginResponse as unknown as { role?: string; Role?: string };
                    const rawRole = loginResponseAny.role ?? loginResponseAny.Role;
                    const rawRoleLower = String(rawRole ?? 'Caregiver').trim().toLowerCase();

                    // `middleware.ts` yêu cầu cookie `userRole` chứa các giá trị:
                    // ADMIN, DOCTOR, CAREGIVER, FAMILY
                    const mappedRole =
                        rawRoleLower === 'administrator' || rawRoleLower === 'admin'
                            ? 'ADMIN'
                            : rawRoleLower === 'doctor'
                              ? 'DOCTOR'
                              : rawRoleLower === 'caregiver'
                                ? 'CAREGIVER'
                                : rawRoleLower === 'familymember' || rawRoleLower === 'family member' || rawRoleLower === 'family'
                                  ? 'FAMILY'
                                  : rawRoleLower === 'elderlyuser' || rawRoleLower === 'elderly user' || rawRoleLower === 'elderly'
                                    ? 'CAREGIVER'
                                    : String(rawRole ?? 'Caregiver').toUpperCase();

                    // Cookies are what `src/middleware.ts` uses to authorize dashboard routes.
                    if (typeof document !== 'undefined') {
                        document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
                        document.cookie = `userRole=${mappedRole}; path=/; max-age=86400; SameSite=Lax`;
                    }

                    const user: User = {
                        id: loginResponse.id.toString(),
                        name: loginResponse.FullName || loginResponse.email,
                        email: loginResponse.email,
                        phone: loginResponse.phone,
                        // Đồng bộ role trong store với cookie `userRole` để redirect không lệch.
                        role: mappedRole,
                        avatar: undefined,
                    };
                    
                    set({
                        user,
                        accessToken: token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: unknown) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : typeof error === 'object' && error !== null && 'message' in error
                              ? String((error as { message?: unknown }).message || '')
                              : '';

                    set({
                        error: message || 'Đăng nhập thất bại',
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
                } catch (error: unknown) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : typeof error === 'object' && error !== null && 'message' in error
                              ? String((error as { message?: unknown }).message || '')
                              : '';

                    set({
                        error: message || 'Đăng ký thất bại',
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