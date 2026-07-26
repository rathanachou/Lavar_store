import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
} from "../utils/TokenStorage";

export interface AuthContextType {
  token:           string | null;
  role:            string | null;
  login:           (token: string) => void;
  logout:          () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(getAccessToken());
  const [role,  setRole]  = useState<string | null>(null);

  const decodeRole = (jwt: string): string | null => {
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      return payload?.role ?? null;
    } catch {
      return null;
    }
  };

  // Decode role on first load if token already exists
  useEffect(() => {
    if (token) setRole(decodeRole(token));
    else       setRole(null);
  }, [token]);

  const login = (newToken: string) => {
    setAccessToken(newToken);
    setToken(newToken);
    setRole(decodeRole(newToken));
  };

  const logout = () => {
    removeAccessToken();
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, role, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};