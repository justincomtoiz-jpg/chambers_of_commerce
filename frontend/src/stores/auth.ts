import create from 'zustand';

type User = { id: string; grade: number; name?: string };

type AuthState = {
  user: User;
  setGrade: (g: number) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: { id: 'devUser', grade: 0, name: 'Dev User' },
  setGrade: (g) => set((s) => ({ user: { ...s.user, grade: g } })),
}));

export function getAuthHeaders() {
  const state = useAuthStore.getState() as any;
  return {
    'x-user-id': state.user.id,
    'x-user-grade': String(state.user.grade),
    'x-user-name': state.user.name || '',
  };
}
