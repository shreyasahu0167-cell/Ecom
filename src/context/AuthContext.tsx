import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile, Role } from '../types';
import { supabase, isSupabaseConfigured, isDemoMode } from '../lib/supabase';

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  profileError: string | null;
  isSupabaseConfigured: boolean;
  isDemoMode: boolean;
  isPasswordRecoveryMode: boolean;
  setIsPasswordRecoveryMode: (value: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; message: string; demoCode?: string }>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  demoUserLogin: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isPasswordRecoveryMode, setIsPasswordRecoveryMode] = useState<boolean>(false);

  // Initialize Supabase Auth Session or Demo Session
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      if (isDemoMode) {
        // Restore demo session in localStorage only when in explicit demo mode
        try {
          const demoProfile = localStorage.getItem('saanvya_demo_session');
          if (demoProfile) {
            const parsed = JSON.parse(demoProfile);
            if (parsed && typeof parsed === 'object' && parsed.email && parsed.role) {
              setProfile(parsed);
            }
          }
        } catch {
          localStorage.removeItem('saanvya_demo_session');
        }
      } else {
        // When demo mode is disabled and Supabase is not configured, purge any residual demo credentials
        localStorage.removeItem('saanvya_demo_session');
        sessionStorage.removeItem('saanvya_admin_auth');
        sessionStorage.removeItem('saanvya_current_admin_session_v1');
        localStorage.removeItem('saanvya_persistent_admin_session_v1');
        sessionStorage.removeItem('saanvya_demo_reset_code');
        sessionStorage.removeItem('saanvya_demo_reset_email');
        setProfile(null);
      }
      setIsLoading(false);
      return;
    }

    // Live Supabase Auth: Retrieve active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setProfileError('Failed to initialize user session.');
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    }).catch(() => {
      setIsLoading(false);
    });

    // Listen to live auth changes (login, logout, token refresh, password recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // Recovery mode strictly activates on valid Supabase recovery event
          setIsPasswordRecoveryMode(true);
        } else if (event === 'SIGNED_OUT') {
          setIsPasswordRecoveryMode(false);
          setUser(null);
          setProfile(null);
          setProfileError(null);
        }

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

  async function fetchUserProfile(userId: string, authUserEmail: string, maxAttempts = 3) {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let attempts = 0;
    while (attempts < maxAttempts) {
      attempts++;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, role, full_name, phone, saved_addresses')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          setProfile(null);
          setProfileError(`Unable to load user profile from database: ${error.message}`);
          setIsLoading(false);
          return;
        }

        if (data) {
          const verifiedRole = (data.role?.toLowerCase() === 'admin' ? 'admin' : 'customer') as Role;
          setProfile({
            id: data.id,
            email: data.email || authUserEmail,
            role: verifiedRole,
            fullName: data.full_name,
            phone: data.phone,
            savedAddresses: data.saved_addresses || [],
          });
          setProfileError(null);
          setIsLoading(false);
          return;
        }

        // If trigger is still executing asynchronously or row is propagating, wait briefly before retrying
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, attempts * 350));
        }
      } catch (err: any) {
        if (attempts >= maxAttempts) {
          setProfile(null);
          setProfileError(err?.message || 'Failed to load profile record.');
          setIsLoading(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, attempts * 350));
      }
    }

    // If profile is still not found after retries
    setProfile(null);
    setProfileError('User profile provisioning failed or is delayed. Please refresh the page or sign in again.');
    setIsLoading(false);
  }

  const signIn = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      throw new Error('Please enter both email and password.');
    }

    if (!isSupabaseConfigured || !supabase) {
      if (isDemoMode) {
        throw new Error('Database is unconfigured. Use the demo account login buttons in Demo Mode.');
      }
      throw new Error('Authentication is unavailable because Supabase is not configured and Demo Mode is disabled.');
    }

    setIsLoading(true);
    setProfileError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }

    if (data?.user) {
      setUser(data.user);
      await fetchUserProfile(data.user.id, data.user.email || trimmedEmail);
    }
    setIsLoading(false);
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedName = fullName?.trim();

    if (!trimmedEmail || !trimmedPassword) {
      throw new Error('Please enter both email and password.');
    }

    if (!isSupabaseConfigured || !supabase) {
      if (isDemoMode) {
        throw new Error('Database is unconfigured. User registration is simulated in Demo Mode.');
      }
      throw new Error('Authentication is unavailable because Supabase is not configured and Demo Mode is disabled.');
    }

    setIsLoading(true);
    setProfileError(null);

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: trimmedPassword,
      options: {
        data: {
          full_name: trimmedName,
        },
      },
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }

    if (data?.user) {
      setUser(data.user);
      // Wait for database trigger to create profile and fetch verified profile
      await fetchUserProfile(data.user.id, data.user.email || trimmedEmail);
    }
    setIsLoading(false);
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch {
      // Safe fallback on network failure
    } finally {
      // Clean up all local demo sessions and reset states
      localStorage.removeItem('saanvya_demo_session');
      sessionStorage.removeItem('saanvya_admin_auth');
      sessionStorage.removeItem('saanvya_current_admin_session_v1');
      localStorage.removeItem('saanvya_persistent_admin_session_v1');
      sessionStorage.removeItem('saanvya_demo_reset_code');
      sessionStorage.removeItem('saanvya_demo_reset_email');
      setUser(null);
      setProfile(null);
      setProfileError(null);
      setIsPasswordRecoveryMode(false);
    }
  };

  const sendPasswordResetEmail = async (
    email: string
  ): Promise<{ success: boolean; message: string; demoCode?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      throw new Error('Please enter a valid email address.');
    }

    if (isSupabaseConfigured && supabase) {
      const redirectUrl = `${window.location.origin}/#/auth?mode=reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: `A password reset link has been dispatched to ${trimmedEmail}. Please check your inbox and follow the secure link.`,
      };
    } else if (isDemoMode) {
      // Offline / Local Demo mode recovery simulation strictly when VITE_DEMO_MODE=true
      const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem('saanvya_demo_reset_code', demoCode);
      sessionStorage.setItem('saanvya_demo_reset_email', trimmedEmail);

      return {
        success: true,
        message: `A secure password recovery verification code has been generated for ${trimmedEmail}.`,
        demoCode,
      };
    } else {
      throw new Error('Password reset is unavailable because Supabase is not configured and Demo Mode is disabled.');
    }
  };

  const updateUserPassword = async (newPassword: string): Promise<void> => {
    const trimmed = newPassword.trim();
    if (!trimmed) {
      throw new Error('Please enter a valid password.');
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({
        password: trimmed,
      });

      if (error) {
        throw error;
      }
      setIsPasswordRecoveryMode(false);
    } else if (isDemoMode) {
      // Offline / Local Demo mode: clear simulated recovery code
      sessionStorage.removeItem('saanvya_demo_reset_code');
      sessionStorage.removeItem('saanvya_demo_reset_email');
      setIsPasswordRecoveryMode(false);
    } else {
      throw new Error('Password update is unavailable because Supabase is not configured and Demo Mode is disabled.');
    }
  };

  const demoUserLogin = (role: Role) => {
    if (!isDemoMode || isSupabaseConfigured) {
      return;
    }

    const normalizedRole = role.toLowerCase() as Role;
    const demoProf: UserProfile = {
      id: `demo-${normalizedRole}-${Date.now()}`,
      email: normalizedRole === 'admin' ? 'admin@saanvya-demo.local' : 'customer@saanvya-demo.local',
      role: normalizedRole,
      fullName: normalizedRole === 'admin' ? 'Demo Store Administrator' : 'Demo Couture Client',
    };

    setProfile(demoProf);
    setProfileError(null);
    try {
      localStorage.setItem('saanvya_demo_session', JSON.stringify(demoProf));
    } catch {
      // Ignored in sandboxed storage
    }
  };

  // Admin access strictly requires authenticated Supabase user + database profile role='admin' in production
  const isAdmin: boolean = Boolean(
    (isSupabaseConfigured && user && profile && profile.id === user.id && (profile.role === 'admin' || profile.role === 'ADMIN')) ||
    (!isSupabaseConfigured && isDemoMode && profile && (profile.role === 'admin' || profile.role === 'ADMIN'))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isLoading,
        profileError,
        isSupabaseConfigured,
        isDemoMode,
        isPasswordRecoveryMode,
        setIsPasswordRecoveryMode,
        signIn,
        signUp,
        signOut,
        sendPasswordResetEmail,
        updateUserPassword,
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
