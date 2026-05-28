import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Aquí controlas el estado manualmente para probar
  const [user, setUser] = useState(null); 

  const login = () => {
    try {
      window.localStorage.setItem('isAdmin', 'true');
    } catch (e) {
      // ignore
    }

    setUser({ name: "Jade", role: "Admin", avatar: "J" });
  };

  const logout = () => {
    try {
      window.localStorage.removeItem('isAdmin');
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