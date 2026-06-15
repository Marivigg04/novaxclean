import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { requestPasswordReset, verifyAndChangePassword } from "../lib/password";
import { fetchEnrichedUserProfile } from "@/features/user/profile/data/userService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistUser = useCallback((profile) => {
    setUser(profile);
    if (profile) {
      window.localStorage.setItem('user', JSON.stringify(profile));
      if (profile.role === 'Admin') {
        window.localStorage.setItem('isAdmin', 'true');
      } else {
        window.localStorage.removeItem('isAdmin');
      }
    } else {
      window.localStorage.removeItem('user');
      window.localStorage.removeItem('isAdmin');
    }
  }, []);

  const fetchUserProfile = useCallback(async (userId, sessionUser) => {
    try {
      return await fetchEnrichedUserProfile(userId, sessionUser);
    } catch (e) {
      console.error("Error in fetchUserProfile:", e);
      return null;
    }
  }, []);

  const syncSessionUser = useCallback(async (sessionUser) => {
    if (sessionUser) {
      const profile = await fetchUserProfile(sessionUser.id, sessionUser);
      persistUser(profile);
    } else {
      persistUser(null);
    }
  }, [fetchUserProfile, persistUser]);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchUserProfile(session.user.id, session.user);
      persistUser(profile);
      return profile;
    }
    persistUser(null);
    return null;
  }, [fetchUserProfile, persistUser]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await syncSessionUser(session?.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncSessionUser(session?.user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncSessionUser]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw error;
    }
    
    if (data?.user) {
      const profile = await fetchUserProfile(data.user.id, data.user);
      persistUser(profile);
    }
    
    return data;
  };

  const register = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      throw error;
    }
    return data;
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth'
      }
    });

    if (error) {
      throw error;
    }
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    persistUser(null);
    if (error) {
      throw error;
    }
  };

  const resetPassword = async (email) => {
    await requestPasswordReset(email);
  };

  const changePassword = async (currentPassword, newPassword) => {
    const email = user?.email;
    if (!email) {
      throw new Error('No hay una sesión activa.');
    }

    await verifyAndChangePassword(email, currentPassword, newPassword);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      loginWithGoogle,
      logout,
      resetPassword,
      changePassword,
      refreshUser,
      loading,
      isAuthenticated: !!user, 
      isAdmin: user?.role === 'Admin' 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
