import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (import.meta.env as any).NEXT_PUBLIC_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// Prepare the authentication service setup
export const authService = {
  async signInWithGoogle() {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  },
  async signOut() {
    return supabase.auth.signOut();
  },
  async getSession() {
    return supabase.auth.getSession();
  },
  onAuthStateChange(callback: (event: any, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
