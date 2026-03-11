import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock users for demo (in production, this would be Supabase Auth)
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@aplusmed.com',
    name: 'Admin User',
    role: 'admin',
    approved: true,
  },
  {
    id: '2',
    email: 'john@hospital.com',
    name: 'John Smith',
    company: 'City Hospital',
    role: 'customer',
    approved: true,
  },
  {
    id: '3',
    email: 'supplier@medtech.com',
    name: 'MedTech Solutions',
    company: 'MedTech Solutions',
    role: 'vendor',
    approved: true,
    vendorId: 'VEN-001',
    commissionRate: 15,
  },
  {
    id: '4',
    email: 'supplier@safeguard.com',
    name: 'SafeGuard Medical',
    company: 'SafeGuard Medical',
    role: 'vendor',
    approved: true,
    vendorId: 'VEN-002',
    commissionRate: 12,
  },
  {
    id: '5',
    email: 'contact@globalmedical.com',
    name: 'Global Medical Supplies Inc.',
    company: 'Global Medical Supplies Inc.',
    role: 'vendor',
    approved: false, // pending admin approval
    vendorId: 'VAPP-001',
  },
];

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      // Login function
      login: async (email, password) => {
        set({ loading: true, error: null });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const user = MOCK_USERS.find(u => u.email === email);
        
        if (user && user.approved) {
          set({ user, loading: false });
          return { success: true };
        } else if (user && !user.approved) {
          set({ loading: false, error: 'Your vendor application is pending admin approval.' });
          return { success: false, error: 'Your vendor application is pending admin approval.' };
        } else {
          set({ loading: false, error: 'Invalid credentials' });
          return { success: false, error: 'Invalid credentials' };
        }
      },

      // Register function - supports different user types
      register: async (formData, userType = 'customer') => {
        set({ loading: true, error: null });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if email exists
        const existingUser = MOCK_USERS.find(u => u.email === formData.email);
        if (existingUser) {
          set({ loading: false, error: 'Email already registered' });
          return { success: false, error: 'Email already registered' };
        }
        
        // In production, this would create user in backend
        set({ loading: false });
        
        const messages = {
          customer: 'Registration successful! You can now log in.',
          vendor: 'Vendor application submitted! Our team will review your application and notify you within 2–3 business days.',
        };
        
        return { 
          success: true, 
          message: messages[userType] || messages.customer
        };
      },

      // Logout function
      logout: () => {
        set({ user: null });
      },

      // Role helpers
      isAdmin: () => get().user?.role === 'admin',
      isVendor: () => get().user?.role === 'vendor',
      isCustomer: () => get().user?.role === 'customer',
      // legacy alias
      isSupplier: () => get().user?.role === 'vendor',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
