import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { AppError } from '../utils/appError';
import { auditService } from '../services/auditService';
import { translate } from '../i18n';
import { LEGACY_OWNER_NAME_PREFIX } from '../constants/appDefaults';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const ALLOWED_MOBILES = ['7499563202', '8446887819', '8830156972', '8180852939'];
export const COMMON_PASSWORD = '1234';

// Mobile numbers that can open the Super Admin panel (tracking log + profile).
// Everyone else never sees the menu item and is redirected away from /admin.
// To change: edit this list, or set VITE_SUPER_ADMIN_MOBILES="7499563202,8446887819" in .env
export const SUPER_ADMIN_MOBILES = (import.meta.env?.VITE_SUPER_ADMIN_MOBILES || '7499563202')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

export const getUserMobile = (user) =>
  String(user?.mobile || user?.user_metadata?.mobile || '').replace(/\D/g, '').slice(-10);

// Real name of the user ('' when only the old built-in placeholder name is saved)
export const getUserDisplayName = (user) => {
  const name = user?.user_metadata?.full_name || '';
  return name.startsWith(LEGACY_OWNER_NAME_PREFIX) ? '' : name;
};

// Who is doing an action - used by the tracking log
export const getAuditActor = (user) => ({
  id: user?.id || null,
  name: getUserDisplayName(user) || (getUserMobile(user) ? `+91 ${getUserMobile(user)}` : null),
  mobile: getUserMobile(user) || null
});

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

  // Save the user's name (Super Admin > Profile)
  const updateProfile = async ({ fullName }) => {
    if (!user) return null;
    const name = (fullName || '').trim();
    const before = getUserDisplayName(user);

    const updatedUser = {
      ...user,
      user_metadata: { ...(user.user_metadata || {}), full_name: name }
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.updateUser({ data: { full_name: name } });
      } catch (err) {
        console.warn('Supabase profile update warning:', err.message);
      }
    }

    localStorage.setItem('homebuild_marathi_auth_user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    auditService.log(getAuditActor(updatedUser), 'update', 'profile', {
      entityId: user.id,
      summary: translate('admin.log.profileUpdated', { name: name || '-' }),
      before: { name: before },
      after: { name }
    });

    return updatedUser;
  };

  const value = {
    user,
    loading,
    signInWithMobile,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    isSuperAdmin: !!user && SUPER_ADMIN_MOBILES.includes(getUserMobile(user)),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
