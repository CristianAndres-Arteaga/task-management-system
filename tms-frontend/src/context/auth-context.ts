import { createContext } from "react";
import type { AuthUser, LoginData, SignUpData } from "../types/auth";

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);