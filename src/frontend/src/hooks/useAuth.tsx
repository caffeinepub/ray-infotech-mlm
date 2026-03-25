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
  refresh: () => Promise<void>;
}

const ADMIN_EMAIL = "admin@rayinfotech.com";
const ADMIN_PASSWORD = "admin123";

// Session format: "userId:email" for user sessions, "admin" for admin
function parseSession(
  session: string,
): { userId: string; email: string } | null {
  if (!session || session === "admin") return null;
  const colonIdx = session.indexOf(":");
  if (colonIdx === -1) {
    // Legacy session format (just userId, no email) — can't refresh from backend
    return null;
  }
  return {
    userId: session.substring(0, colonIdx),
    email: session.substring(colonIdx + 1),
  };
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAdmin: false,
  login: async () => false,
  logout: () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Refresh current user from backend
  const refresh = useCallback(async () => {
    const session = getSession();
    if (!session || session === "admin") return;
    const parsed = parseSession(session);
    if (!parsed) {
      // Legacy session — use localStorage
      const u = getCurrentUser();
      setUser(u);
      return;
    }
    try {
      const backendUser = await backendGetUserByEmail(parsed.email);
      if (backendUser) {
        updateUser(backendUser);
        setUser(backendUser);
      }
    } catch (e) {
      console.error("refresh from backend failed:", e);
      const u = getCurrentUser();
      setUser(u);
    }
  }, []);

  useEffect(() => {
    const session = getSession();
    if (session === "admin") {
      setIsAdmin(true);
      setUser(null);
      return;
    }
    if (!session) return;

    const parsed = parseSession(session);
    if (parsed) {
      // Load from localStorage first for instant render
      const localUser = getCurrentUser();
      if (localUser) setUser(localUser);
      // Then refresh from backend (cross-device sync)
      backendGetUserByEmail(parsed.email)
        .then((backendUser) => {
          if (backendUser) {
            updateUser(backendUser);
            setUser(backendUser);
          }
        })
        .catch((e) => {
          console.error("Backend session restore failed:", e);
          if (!localUser) {
            const u = getCurrentUser();
            setUser(u);
          }
        });
    } else {
      // Legacy: just use localStorage
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
      // Try backend first for cross-device login
      try {
        const backendUser = await backendGetUserByEmail(email);
        if (backendUser && backendUser.password === password) {
          // Sync to localStorage cache
          const users = getUsers();
          const idx = users.findIndex((x) => x.id === backendUser.id);
          if (idx === -1) {
            users.push(backendUser);
          } else {
            users[idx] = backendUser;
          }
          saveUsers(users);
          // Store userId:email in session for backend refresh on reload
          setSession(`${backendUser.id}:${backendUser.email}`);
          setUser(backendUser);
          setIsAdmin(false);
          return true;
        }
      } catch (e) {
        console.error("Backend login lookup failed:", e);
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

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
