import { create } from 'zustand';
import { User } from '@/types';

interface AppState {
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
    currentUser: null,
    setCurrentUser: (user) => set({ currentUser: user }),
    isLoading: false,
    setLoading: (loading) => set({ isLoading: loading }),
}));
