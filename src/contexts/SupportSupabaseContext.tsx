import { createContext, useContext, useMemo, ReactNode } from 'react';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';

interface SupportSupabaseContextType {
  supabase: SupabaseClient | null;
}

const SupportSupabaseContext = createContext<SupportSupabaseContextType | undefined>(undefined);

export const SupportSupabaseProvider = ({ children }: { children: ReactNode }) => {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL") {
      console.warn("Supabase URL is not defined or uses the default placeholder. Please set the VITE_SUPABASE_URL environment variable in your .env file.");
    }

    if (!supabaseAnonKey || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
      console.warn("Supabase anon key is not defined or uses the default placeholder. Please set the VITE_SUPABASE_ANON_KEY environment variable in your .env file.");
    }

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "YOUR_SUPABASE_URL" || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
      console.error('Supabase URL or Anon Key is not properly configured. Please check your environment variables and ensure they are not using default placeholder values.');
      return null;
    }
    
    try {
      return createClient(supabaseUrl, supabaseAnonKey, {
        db: {
          schema: 'bean_ai_realtime'  // Use the bean_ai_realtime schema for support features
        },
        global: {
          fetch: async (url, options = {}) => {
            const token = await getToken({template: 'supabase'});
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
      console.error("Failed to create Support Supabase client in provider:", error);
      return null;
    }
  }, [getToken]);

  return (
    <SupportSupabaseContext.Provider value={{ supabase: supabase as SupabaseClient | null }}>
      {children}
    </SupportSupabaseContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSupportSupabase = (): SupabaseClient | null => {
  const context = useContext(SupportSupabaseContext);
  if (context === undefined) {
    throw new Error('useSupportSupabase must be used within a SupportSupabaseProvider. Make sure the component is a child of SupportSupabaseProvider.');
  }
  return context.supabase;
};