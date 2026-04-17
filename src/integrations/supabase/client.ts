// Lazily initialize Supabase to keep it out of the initial bundle
let supabaseInstance: any = null;

const getSupabase = async () => {
  if (supabaseInstance) return supabaseInstance;
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  supabaseInstance = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );
  return supabaseInstance;
};

// Export a proxy that initializes on first access
export const supabase = new Proxy({} as any, {
  get: (target, prop) => {
    // If the instance is already there, return the property
    if (supabaseInstance) return supabaseInstance[prop];
    
    // Otherwise, we return a function that will initialize and then call
    return (...args: any[]) => {
      return getSupabase().then(instance => {
        const value = instance[prop];
        return typeof value === 'function' ? value.apply(instance, args) : value;
      });
    };
  }
});
