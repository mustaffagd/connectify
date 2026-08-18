import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { login as loginApi, register as registerApi, getMe } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("connectify_token"));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  const validateToken = useCallback(async () => {
    try {
      const data = await getMe();
      setUser(data.user || data);
    } catch {
      localStorage.removeItem("connectify_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, [token, validateToken]);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    localStorage.setItem("connectify_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password) => {
    const data = await registerApi(username, email, password);
    localStorage.setItem("connectify_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("connectify_token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
