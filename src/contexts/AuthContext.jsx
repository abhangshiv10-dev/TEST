import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const ALLOWED_MOBILES = ['7499563202', '8446887819', '8830156972', '8180852939'];
export const COMMON_PASSWORD = '1234';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session
    const checkUser = async () => {
      const savedUser = localStorage.getItem('homebuild_marathi_auth_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem('homebuild_marathi_auth_user');
        }
      }

      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
          }
        } catch (err) {
          console.warn('Supabase auth error:', err.message);
        }
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  // Sign in with Mobile & Password
  const signInWithMobile = async (mobile, password) => {
    const cleanMobile = (mobile || '').replace(/\D/g, '').slice(-10);
    const cleanPassword = (password || '').trim();

    if (!ALLOWED_MOBILES.includes(cleanMobile)) {
      throw new Error('हा मोबाईल नंबर अधिकृत नाही. कृपया नोंदणीकृत मोबाईल नंबर टाका.');
    }

    if (cleanPassword !== COMMON_PASSWORD) {
      throw new Error('पासवर्ड चुकीचा आहे. कृपया पुन्हा तपासा.');
    }

    const authUser = {
      id: `user-${cleanMobile}`,
      mobile: cleanMobile,
      email: `${cleanMobile}@gharbhandkam.com`,
      user_metadata: {
        full_name: `घरमालक (${cleanMobile})`,
        mobile: cleanMobile
      }
    };

    localStorage.setItem('homebuild_marathi_auth_user', JSON.stringify(authUser));
    setUser(authUser);
    return authUser;
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
    signInWithMobile,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
