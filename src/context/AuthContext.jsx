import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Aquí controlas el estado manualmente para probar
  const [user, setUser] = useState(null); 

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('user');
      if (raw) {
        setUser(JSON.parse(raw));
        return;
      }

      // fallback to legacy flag
      const isAdmin = window.localStorage.getItem('isAdmin');
      if (isAdmin) {
        setUser({ name: 'Jade', role: 'Admin', avatar: 'J' });
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const login = () => {
    try {
      window.localStorage.setItem('isAdmin', 'true');
      window.localStorage.setItem('user', JSON.stringify({ name: 'Jade', role: 'Admin', avatar: 'J' }));
    } catch (e) {
      // ignore
    }

    setUser({ name: "Jade", role: "Admin", avatar: "J" });
  };

  const logout = () => {
    try {
      window.localStorage.removeItem('isAdmin');
      window.localStorage.removeItem('user');
    } catch (e) {
      // ignore
    }

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthContext;