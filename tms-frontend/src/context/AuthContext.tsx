import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import * as authApi from "../api/auth";
import type { AuthUser, LoginData, SignUpData } from "../types/auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cognitoUser = authApi.userPool.getCurrentUser();

    if (!cognitoUser) {
      setLoading(false);
      return;
    }

    cognitoUser.getSession((err: Error | null, session: any) => {
      if (err || !session || !session.isValid()) {
        setUser(null);
        setLoading(false);
        return;
      }
      const payload = session.getIdToken().payload;
      setUser({ sub: payload.sub, email: payload.email });
      setLoading(false);
    });
  }, []);

  const handleLogin = async (data: LoginData) => {
    const authUser = await authApi.login(data);
    setUser(authUser);
  };

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    signUp: authApi.signUp,
    confirmSignUp: authApi.confirmSignUp,
    login: handleLogin,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}