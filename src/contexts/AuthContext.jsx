import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { AppError } from '../utils/appError';

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
      throw new AppError('mobileNotAuthorized');
    }

    if (cleanPassword !== COMMON_PASSWORD) {
      throw new AppError('wrongPassword');
    }

    let authUser = {
      id: `user-${cleanMobile}`,
      mobile: cleanMobile,
      email: `${cleanMobile}@gharbhandkam.com`,
      user_metadata: {
        mobile: cleanMobile
      }
    };

    if (isSupabaseConfigured()) {
      const email = `mobile_${cleanMobile}@gharbhandkam.com`;
      const supabasePassword = `GharPass${COMMON_PASSWORD}!`;

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: supabasePassword
        });

        if (error) {
          // If user doesn't exist yet in Supabase Auth, register them automatically
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: supabasePassword,
            options: {
              data: {
                mobile: cleanMobile
              }
            }
          });

          if (!signUpError && signUpData?.user) {
            authUser = signUpData.user;
          }
        } else if (data?.user) {
          authUser = data.user;
        }
      } catch (err) {
        console.warn('Supabase mobile auth bridge:', err);
      }
    }

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
