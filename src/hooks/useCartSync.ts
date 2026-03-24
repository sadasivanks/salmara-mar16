import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

export function useCartSync() {
  const { syncCart, clearCart } = useCartStore();

  useEffect(() => {
    // Initial sync
    syncCart();

    // Check if we just returned from a checkout
    const isPending = localStorage.getItem('shopify_checkout_pending');
    if (isPending === 'true') {
      console.log("Global Auto-Sync: Order detected via pending flag, clearing cart...");
      clearCart();
      localStorage.removeItem('shopify_checkout_pending');
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncCart();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncCart, clearCart]);
}
