import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    userId: null,
    token: null,
    username: null,
    avatarUrl: null,
  });

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser({ userId: null, token: null, username: null, avatarUrl: null });
  };

  return (
    <AuthContext.Provider value={{ ...user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);