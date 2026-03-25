import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type User,
  clearSession,
  getCurrentUser,
  getSession,
  getUserByEmail,
  getUsers,
  saveUsers,
  setSession,
  updateUser,
} from "../lib/store";
import { backendGetUserByEmail } from "../lib/tradingApi";

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refresh: () => void;
}

const ADMIN_EMAIL = "admin@rayinfotech.com";
const ADMIN_PASSWORD = "admin123";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAdmin: false,
  login: async () => false,
  logout: () => {},
  refresh: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session === "admin") {
      setIsAdmin(true);
      setUser(null);
    } else if (session) {
      const u = getCurrentUser();
      setUser(u);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        setSession("admin");
        setIsAdmin(true);
        setUser(null);
        return true;
      }
      // Check localStorage first (fast path)
      let u = getUserByEmail(email);
      if (!u) {
        // Fall back to backend lookup
        try {
          const backendUser = await backendGetUserByEmail(email);
          if (backendUser) {
            // Cache in localStorage
            const users = getUsers();
            if (!users.find((x) => x.id === backendUser.id)) {
              users.push(backendUser);
              saveUsers(users);
            }
            u = backendUser;
          }
        } catch (e) {
          console.error("Backend login lookup failed:", e);
        }
      }
      if (u && u.password === password) {
        setSession(u.id);
        setUser(u);
        setIsAdmin(false);
        return true;
      }
      return false;
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setIsAdmin(false);
  }, []);

  const refresh = useCallback(() => {
    const u = getCurrentUser();
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
