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

    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterDTO) => Promise<void>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
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

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const loginResponse: AccountResponse = await authService.login({ email, password });
                    const token = loginResponse.token;

                    if (!token) {
                        throw new Error("Không nhận được token từ hệ thống");
                    }

                    authService.setToken(token);

                    // Trích xuất Role từ Backend (Enum: ADMINISTRATOR, FAMILYMEMBER, v.v.)
                    const rawRole = (loginResponse as any).role || (loginResponse as any).Role || "";
                    let roleStr = typeof rawRole === 'string' ? rawRole : (rawRole?.name || String(rawRole));
                    roleStr = roleStr.replace(/^ROLE_/i, '');
                    let roleLower = roleStr.toLowerCase().trim();

                    // Mẹo xử lý tạm từ tu2: FE tự inference Role nếu BE không trả về
                    if (!roleLower || roleLower === 'undefined' || roleLower === 'null' || roleLower === '') {
                        const emailLower = email.toLowerCase();
                        if (emailLower.includes('admin')) {
                            roleLower = 'admin';
                        } else if (emailLower.includes('manager')) {
                            roleLower = 'manager';
                        } else if (emailLower.includes('elderly') || emailLower.includes('family')) {
                            roleLower = 'elderly';
                        } else {
                            roleLower = 'admin'; // Fallback default
                        }
                    }

                    // Ánh xạ sang hằng số Role dùng cho Middleware (Enum: ADMIN, MANAGER, CAREGIVER, ELDERLY)
                    const mappedRole =
                        roleLower === 'administrator' || roleLower === 'admin'
                            ? 'ADMIN'
                            : roleLower === 'manager'
                                ? 'MANAGER'
                                : roleLower === 'caregiver'
                                    ? 'CAREGIVER'
                                    : roleLower === 'elderly' || roleLower === 'family' || roleLower === 'familymember' || roleLower === 'elderlyuser'
                                        ? 'ELDERLY'
                                        : 'ADMIN'; // Fallback



                    // Cookies are what `src/middleware.ts` uses to authorize dashboard routes.
                    if (typeof document !== 'undefined') {
                        document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
                        document.cookie = `userRole=${mappedRole}; path=/; max-age=86400; SameSite=Lax`;
                    }

                    const user: User = {
                        id: loginResponse.id.toString(),
                        name: (loginResponse.fullName || loginResponse.FullName) || loginResponse.email,
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
                        fullName: data.name.trim(),
                        email: data.email.trim(),
                        phone: (data.phone || '').trim(),
                        password: data.password,
                        role: 'FAMILYMEMBER', // Ghi cứng để tránh lỗi Enum Administrator
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

            verifyOtp: async (email: string, otp: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response: AccountResponse = await authService.verifyOtp({ email, otp });
                    
                    // Nếu Backend có trả về token sau khi verify (để auto-login)
                    const token = response?.token;
                    if (token) {
                        authService.setToken(token);

                        // Đồng bộ logic xử lý role giống hệt hàm login
                        const rawRole = (response as any).role || (response as any).Role || "";
                        let roleStr = typeof rawRole === 'string' ? rawRole : (rawRole?.name || String(rawRole));
                        roleStr = roleStr.replace(/^ROLE_/i, '');
                        let roleLower = roleStr.toLowerCase().trim();

                        const mappedRole =
                            roleLower === 'administrator' || roleLower === 'admin'
                                ? 'ADMIN'
                                : roleLower === 'manager'
                                    ? 'MANAGER'
                                    : roleLower === 'caregiver'
                                        ? 'CAREGIVER'
                                        : roleLower === 'elderly' || roleLower === 'family' || roleLower === 'familymember' || roleLower === 'elderlyuser'
                                            ? 'ELDERLY'
                                            : 'ADMIN';

                        if (typeof document !== 'undefined') {
                            document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
                            document.cookie = `userRole=${mappedRole}; path=/; max-age=86400; SameSite=Lax`;
                        }

                        const user: User = {
                            id: response.id.toString(),
                            name: (response.fullName || response.FullName) || response.email,
                            email: response.email,
                            phone: response.phone,
                            role: mappedRole,
                            avatar: undefined,
                        };

                        set({
                            user,
                            accessToken: token,
                            isAuthenticated: true,
                        });
                    }
                } catch (error: unknown) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : typeof error === 'object' && error !== null && 'message' in error
                                ? String((error as { message?: unknown }).message || '')
                                : '';

                    set({
                        error: message || 'Xác thực OTP thất bại',
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