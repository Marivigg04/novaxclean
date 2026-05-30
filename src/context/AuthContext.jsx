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
        setUser({
          name: 'Jade',
          email: 'admin@novaxclean.com',
          phone: '+58 412-000-0000',
          role: 'Admin',
          avatar: 'J',
          address: 'Av. Principal 123, Torre Corporativa, Caracas, Distrito Capital',
        });
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const login = (userData) => {
    // Si no se pasa data asumimos el Admin legado por compatibilidad
    const newUser = userData || {
      name: 'Jade',
      email: 'admin@novaxclean.com',
      phone: '+58 412-000-0000',
      role: 'Admin',
      avatar: 'J',
      address: 'Av. Principal 123, Torre Corporativa, Caracas, Distrito Capital',
    };

    try {
      window.localStorage.setItem('user', JSON.stringify(newUser));
      if (newUser.role === 'Admin') {
        window.localStorage.setItem('isAdmin', 'true');
      } else {
        window.localStorage.removeItem('isAdmin');
      }
    } catch (e) {
      // ignore
    }

    setUser(newUser);
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
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isAdmin: user?.role === 'Admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthContext;