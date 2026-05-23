import { create } from 'zustand'
import { User, UserRole } from '../types'

interface AuthState {
  token: string | null;
  user: {
    email: string;
    role: UserRole;
    username: string;
  } | null;
  isAuthenticated: boolean;
  login: (token: string, email: string, role: UserRole, username: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  login: (token, email, role, username) => {
    localStorage.setItem('project-mccaren_token', token);
    localStorage.setItem('project-mccaren_user', JSON.stringify({ email, role, username }));
    set({ token, user: { email, role, username }, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('project-mccaren_token');
    localStorage.removeItem('project-mccaren_user');
    set({ token: null, user: null, isAuthenticated: false });
  },
  initialize: () => {
    const token = localStorage.getItem('project-mccaren_token');
    const userJson = localStorage.getItem('project-mccaren_user');
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        set({ token, user, isAuthenticated: true });
      } catch {
        localStorage.removeItem('project-mccaren_token');
        localStorage.removeItem('project-mccaren_user');
      }
    }
  }
}))
