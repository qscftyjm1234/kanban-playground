import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('kanban-user')) || null,
  isAuthenticated: !!localStorage.getItem('kanban-token'),

  login: (userData) => {
    localStorage.setItem('kanban-token', userData.token);
    localStorage.setItem('kanban-user', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('kanban-token');
    localStorage.removeItem('kanban-user');
    set({ user: null, isAuthenticated: false });
    window.location.href = '/login';
  },
}));

export default useAuthStore;
