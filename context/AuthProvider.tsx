import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  PropsWithChildren,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch, TOKEN_KEY } from "@/constants/api";

type User = {
  id: string;
  name?: string;
  email?: string;
  balance?: number;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  session: User | null; // alias kept for existing callers
  loading: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the saved session on app start.
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (userData: User, token: string) => {
    setUser(userData);
    await AsyncStorage.multiSet([
      ["user", JSON.stringify(userData)],
      [TOKEN_KEY, token],
    ]);
  };

  // Pull the latest profile (wallet balance changes after top-ups/orders).
  const refreshUser = async () => {
    try {
      const data = await apiFetch<{ success: boolean; user: User }>("/api/me");
      if (data.success && data.user) {
        setUser(data.user);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (err) {
      console.error("Refresh user failed:", err);
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      setUser(null);
      await AsyncStorage.multiRemove(["user", TOKEN_KEY]);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session: user, loading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
