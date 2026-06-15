import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { requestPasswordReset, verifyAndChangePassword } from "../lib/password";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch custom profile details from public.users table
  const fetchUserProfile = async (userId, sessionUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      let userObj;
      if (error) {
        console.warn("Could not fetch user profile from public.users:", error.message);
        // Fallback to session details if trigger hasn't finished or profile table is empty
        userObj = {
          id: userId,
          name: sessionUser?.user_metadata?.name || 'Usuario',
          email: sessionUser?.email,
          role: 'User', // default fallback role
          avatar: null,
          phone: null,
          address: null
        };
      } else {
        // Map DB avatar_url to avatar prop used in frontend components
        userObj = {
          ...profile,
          avatar: profile.avatar_url || (profile.name ? profile.name.charAt(0).toUpperCase() : 'U'),
          address: profile.address || ''
        };
      }

      return userObj;
    } catch (e) {
      console.error("Error in fetchUserProfile:", e);
      return null;
    }
  };

  const syncSessionUser = async (sessionUser) => {
    if (sessionUser) {
      const profile = await fetchUserProfile(sessionUser.id, sessionUser);
      setUser(profile);
      window.localStorage.setItem('user', JSON.stringify(profile));
      if (profile?.role === 'Admin') {
        window.localStorage.setItem('isAdmin', 'true');
      } else {
        window.localStorage.removeItem('isAdmin');
      }
    } else {
      setUser(null);
      window.localStorage.removeItem('user');
      window.localStorage.removeItem('isAdmin');
    }
  };

  useEffect(() => {
    // 1. Check current active session on load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await syncSessionUser(session?.user);
      setLoading(false);
    });

    // 2. Listen for auth changes (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      await syncSessionUser(session?.user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login handler
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw error;
    }
    
    // Explicit sync to localStorage on immediate success
    if (data?.user) {
      const profile = await fetchUserProfile(data.user.id, data.user);
      setUser(profile);
      window.localStorage.setItem('user', JSON.stringify(profile));
      if (profile?.role === 'Admin') {
        window.localStorage.setItem('isAdmin', 'true');
      } else {
        window.localStorage.removeItem('isAdmin');
      }
    }
    
    return data;
  };

  // Sign up handler
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

  // Google OAuth Login handler
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

  // Logout handler
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('isAdmin');
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