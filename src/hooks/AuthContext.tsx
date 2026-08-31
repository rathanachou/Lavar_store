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
  loading:         boolean;
  login:           (token: string) => void;
  logout:          () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(getAccessToken());
  const [role,  setRole]  = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const decodeRole = (jwt: string): string | null => {
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      return payload?.role ?? null;
    } catch {
      return null;
    }
  };

  // On mount: decode role from persisted token (if any), then clear loading.
  // This must complete before any route guard can redirect.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (token) {
        setRole(decodeRole(token));
      } else {
        setRole(null);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = (newToken: string) => {
    setAccessToken(newToken);
    setToken(newToken);
    setRole(decodeRole(newToken));
    setLoading(false);
  };

  const logout = () => {
    removeAccessToken();
    setToken(null);
    setRole(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ token, role, loading, login, logout, isAuthenticated: !!token }}
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