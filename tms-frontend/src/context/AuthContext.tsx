import {
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import type { CognitoUserSession } from "amazon-cognito-identity-js";
import * as authApi from "../api/auth";
import type { AuthUser, LoginData } from "../types/auth";
import { AuthContext, type AuthContextType } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(() => !!authApi.userPool.getCurrentUser());

  useEffect(() => {
    const cognitoUser = authApi.userPool.getCurrentUser();

    if (!cognitoUser) {
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
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