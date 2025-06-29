// src/contexts/GamifySupabaseContext.tsx
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';
import { createContext, useContext, useMemo, ReactNode } from 'react';

interface GamifySupabaseContextType {
  supabase: SupabaseClient<any, 'public', any> | null;
}

const GamifySupabaseContext = createContext<GamifySupabaseContextType | undefined>(undefined);

export function GamifySupabaseProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    const url = import.meta.env.VITE_SUPABASE_URL!;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
    if (!url || !anonKey) return null;

    return createClient(url, anonKey, {
      db: { schema: 'public' },
      global: {
        fetch: async (input: string | URL | Request, init?: RequestInit) => {
          const token = await getToken({ template: 'supabase' });
          const headers = new Headers(init?.headers);
          if (token) headers.set('Authorization', `Bearer ${token}`);
          return fetch(input, { ...init, headers });
        },
      },
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
        autoRefreshToken: false,
      },
    });
  }, [getToken]);

  return (
    <GamifySupabaseContext.Provider value={{ supabase }}>
      {children}
    </GamifySupabaseContext.Provider>
  );
}

export function useGamifySupabase(): SupabaseClient<any, 'public', any> | null {
  const ctx = useContext(GamifySupabaseContext);
  if (!ctx) throw new Error('useGamifySupabase must be used within GamifySupabaseProvider');
  return ctx.supabase;
}