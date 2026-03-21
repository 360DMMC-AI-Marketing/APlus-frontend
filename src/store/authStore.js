import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as apiLogin, register as apiRegister } from '../api/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      // Login — calls real backend API
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const user = await apiLogin(email, password);
          set({ user, loading: false });
          return { success: true };
        } catch (err) {
          const message = err.message || 'Invalid credentials';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      // Register — calls real backend API
      register: async (formData, userType = 'customer') => {
        set({ loading: true, error: null });
        try {
          await apiRegister({ ...formData, role: userType });
          set({ loading: false });

          const messages = {
            customer: 'Registration successful! You can now log in.',
            vendor: 'Vendor application submitted! Our team will review your application and notify you within 2-3 business days.',
          };

          return {
            success: true,
            message: messages[userType] || messages.customer,
          };
        } catch (err) {
          const message = err.message || 'Registration failed';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      // Set user directly (used by LoginPage after apiLogin)
      setUser: (user) => set({ user }),

      // Logout
      logout: () => {
        localStorage.removeItem('accessToken');
        set({ user: null, error: null });
      },

      // Role helpers
      isAdmin: () => get().user?.role === 'admin',
      isVendor: () => get().user?.role === 'vendor',
      isCustomer: () => get().user?.role === 'customer',
      isSupplier: () => get().user?.role === 'vendor',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
