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
                     const roleLower = roleStr.toLowerCase().trim();
                     console.log("🛠️ Raw Login Response Role:", rawRole);
                     console.log("🛠️ Parsed roleLower:", roleLower);
 
                     // Ánh xạ sang hằng số Role dùng cho Middleware
                     const mappedRole =
                         roleLower === 'administrator' || roleLower === 'admin'
                             ? 'ADMIN'
                         : roleLower === 'manager'
                             ? 'MANAGER'
                             : roleLower === 'doctor'
                               ? 'DOCTOR'
                               : roleLower === 'caregiver'
                                 ? 'CAREGIVER'
                                 : roleLower === 'familymember' || roleLower === 'elderlyuser' || roleLower === 'family'
                                     ? 'FAMILY'
                                     : 'ADMIN'; // Fallback
                     console.log("🛠️ Mapped Role for Cookie:", mappedRole);


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
                    await authService.verifyOtp({ email, otp });
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