import { useEffect } from 'react';

/**
 * Hook to manage page lifecycle events for Back/Forward Cache (bfcache).
 * Ensures that the application state is reconciled when the page is restored from cache.
 */
export function useBfcache(onRestore?: () => void) {
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('[Bfcache] Page restored from cache. Reconciling state...');
        if (onRestore) {
          onRestore();
        }
        // Emit a global event for components to react to restoration
        window.dispatchEvent(new CustomEvent('app-restored-from-cache'));
      }
    };

    const handlePageHide = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('[Bfcache] Page entering cache. Cleaning up triggers...');
      } else {
        console.log('[Bfcache] Page being unloaded.');
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [onRestore]);
}
