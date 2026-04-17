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

      clearCart();
      localStorage.removeItem('shopify_checkout_pending');
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncCart();
    };

    const handleRestore = () => {
      syncCart();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('app-restored-from-cache', handleRestore);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('app-restored-from-cache', handleRestore);
    };
  }, [syncCart, clearCart]);
}

