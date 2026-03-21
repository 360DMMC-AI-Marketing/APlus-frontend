import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // Add item to cart
      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(item => item.id === product.id);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [...items, { ...product, quantity }],
          });
        }
      },
      
      // Remove item from cart
      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.id !== productId),
        });
      },
      
      // Update item quantity
      updateQuantity: (productId, quantity) => {
        const item = get().items.find(i => i.id === productId);
        if (!item) return;

        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        if (item.stock && quantity > item.stock) return;

        set({
          items: get().items.map(i =>
            i.id === productId ? { ...i, quantity } : i
          ),
        });
      },

      // Clear cart
      clearCart: () => {
        set({ items: [] });
      },
      
      // Get cart total
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      
      // Get cart items count
      getItemsCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
