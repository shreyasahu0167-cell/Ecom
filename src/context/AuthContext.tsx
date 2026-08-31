import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile, Role } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  demoUserLogin: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Supabase Auth Session if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Check for demo session in localStorage
      try {
        const demoProfile = localStorage.getItem('saanvya_demo_session');
        if (demoProfile) {
          setProfile(JSON.parse(demoProfile));
        }
      } catch (e) {
        console.warn('Failed to parse demo session', e);
      }
      setIsLoading(false);
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      } else {
        setIsLoading(false);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id, session.user.email || '');
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchUserProfile(userId: string, email: string) {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
      }

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          role: data.role as Role,
          fullName: data.full_name,
          phone: data.phone,
          savedAddresses: data.saved_addresses || [],
        });
      } else {
        // Fallback default customer profile
        setProfile({
          id: userId,
          email,
          role: 'customer',
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error(
        'Supabase client is not available. Please verify credentials.'
      );
    }
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      throw error;
    }

    if (data?.user) {
      setUser(data.user);
      await fetchUserProfile(data.user.id, data.user.email || email);
    }
    setIsLoading(false);
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) {
      throw new Error(
        'Supabase client is not available. Please verify credentials.'
      );
    }
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }

    if (data.user) {
      // Set active client profile immediately
      setProfile({
        id: data.user.id,
        email,
        fullName: fullName || email.split('@')[0],
        role: 'customer',
      });

      // Attempt to upsert into profiles database table if present
      try {
        await supabase.from('profiles').upsert([
          {
            id: data.user.id,
            email,
            full_name: fullName,
            role: 'customer',
          },
        ]);
      } catch (insertErr) {
        console.warn('Profiles table sync:', insertErr);
      }
    }
    setIsLoading(false);
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('saanvya_demo_session');
    }
    setUser(null);
    setProfile(null);
  };

  const demoUserLogin = (role: Role) => {
    if (isSupabaseConfigured) {
      console.warn('Demo login is disabled when connected to live Supabase.');
      return;
    }
    const demoProf: UserProfile = {
      id: `demo-${role}-${Date.now()}`,
      email: role === 'admin' ? 'admin@saanvya-demo.local' : 'customer@saanvya-demo.local',
      role,
      fullName: role === 'admin' ? 'Demo Store Administrator' : 'Demo Couture Client',
    };
    setProfile(demoProf);
    try {
      localStorage.setItem('saanvya_demo_session', JSON.stringify(demoProf));
    } catch {}
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isLoading,
        isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        demoUserLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
