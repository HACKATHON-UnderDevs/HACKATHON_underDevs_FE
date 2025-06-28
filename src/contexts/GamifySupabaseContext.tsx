// src/contexts/GamifySupabaseContext.tsx
import { createContext, useContext, useMemo, ReactNode } from 'react';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';

interface GamifySupabaseContextType {
  supabase: SupabaseClient<any, "vibe_learning_gamify_quizz", any> | null;
}

const GamifySupabaseContext = createContext<GamifySupabaseContextType | undefined>(undefined);

export const GamifySupabaseProvider = ({ children }: { children: ReactNode }) => {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL" || !supabaseAnonKey || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
      console.error('Gamify Supabase URL or Anon Key is not properly configured.');
      return null;
    }
    
    try {
      return createClient(supabaseUrl, supabaseAnonKey, {
        db: {
          schema: 'vibe_learning_gamify_quizz'
        },
        global: {
          fetch: async (url: RequestInfo | URL, options: RequestInit = {}) => {
            const token = await getToken({ template: 'supabase' });
            const headers = new Headers(options.headers);
            if (token) {
              headers.set('Authorization', `Bearer ${token}`);
            }
            return fetch(url, {
              ...options,
              headers,
            });
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        }
      });
    } catch (error) {
      console.error("Failed to create Gamify Supabase client in provider:", error);
      return null;
    }
  }, [getToken]);

  return (
    <GamifySupabaseContext.Provider value={{ supabase }}>
      {children}
    </GamifySupabaseContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGamifySupabase = (): SupabaseClient<any, "vibe_learning_gamify_quizz", any> | null => {
  const context = useContext(GamifySupabaseContext);
  if (context === undefined) {
    throw new Error('useGamifySupabase must be used within a GamifySupabaseProvider.');
  }
  return context.supabase;
};