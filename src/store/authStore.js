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
      login: async (email, password, captchaToken) => {
        set({ loading: true, error: null });
        try {
          const user = await apiLogin(email, password, captchaToken);
          set({ user, loading: false });
          return { success: true };
        } catch (err) {
          const message = err.message || 'Invalid credentials';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      // Register — calls real backend API
      register: async (formData, userType = 'customer', captchaToken = null) => {
        set({ loading: true, error: null });
        try {
          // Backend accepts 'customer' or 'supplier' (not 'vendor')
          const backendRole = userType === 'vendor' ? 'supplier' : userType;

          // Map frontend field names to what backend expects
          const payload = {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: backendRole,
            companyName: formData.companyName || formData.company || undefined,
            phone: formData.phone || formData.businessPhone || undefined,
          };

          // Include vendor/supplier-specific fields when registering as supplier
          // Only send fields the backend schema accepts
          if (backendRole === 'supplier') {
            payload.companyName = formData.companyName || undefined;
            payload.taxId = formData.taxId || undefined;
            payload.businessAddress = formData.businessAddress || undefined;
            payload.yearsInBusiness = formData.yearsInBusiness ? Number(formData.yearsInBusiness) : undefined;
            payload.businessLicense = formData.businessLicense || undefined;
            payload.categories = formData.categories || undefined;
          }

          await apiRegister(payload, captchaToken);
          set({ loading: false });

          const messages = {
            customer: 'Registration successful! Your account is pending admin approval.',
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
        localStorage.removeItem('refreshToken');
        set({ user: null, error: null });
      },

      // Role helpers — backend uses 'supplier' not 'vendor'
      isAdmin: () => get().user?.role === 'admin',
      isVendor: () => get().user?.role === 'supplier',
      isCustomer: () => get().user?.role === 'customer',
      isSupplier: () => get().user?.role === 'supplier',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
