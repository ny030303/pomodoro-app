import create from 'zustand';

export const useUserStore = create((set) => ({
  isLoggedIn: false,
  userProfile: null,
  login: (profile) => set({ isLoggedIn: true, userProfile: profile }),
  logout: () => set({ isLoggedIn: false, userProfile: null }),
}));