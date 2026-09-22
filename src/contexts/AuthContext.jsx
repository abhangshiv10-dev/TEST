import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session
    const checkUser = async () => {
      // 1. Check local demo session
      const demoUser = localStorage.getItem('homebuild_marathi_auth_user');
      if (demoUser) {
        try {
          setUser(JSON.parse(demoUser));
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem('homebuild_marathi_auth_user');
        }
      }

      // 2. Check Supabase session
      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user || null);

          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
          });

          setLoading(false);
          return () => subscription.unsubscribe();
        } catch (err) {
          console.warn('Supabase auth error:', err.message);
        }
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  // 1-Click Demo Login
  const loginDemo = () => {
    const mockUser = {
      id: 'demo-user-1',
      email: 'demo@gharbhandkam.com',
      user_metadata: { full_name: 'घरमालक' }
    };
    setUser(mockUser);
    localStorage.setItem('homebuild_marathi_auth_user', JSON.stringify(mockUser));
    return { success: true };
  };

  // Sign in with Email/Password
  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      // Offline fallback
      return loginDemo();
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    setUser(data.user);
    return data;
  };

  // Sign up
  const signUp = async (email, password, fullName) => {
    if (!isSupabaseConfigured()) {
      return loginDemo();
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    setUser(data.user);
    return data;
  };

  // Sign out
  const signOut = async () => {
    localStorage.removeItem('homebuild_marathi_auth_user');
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Signout warning:', err.message);
      }
    }
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    loginDemo,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
