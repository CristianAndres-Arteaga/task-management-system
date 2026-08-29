import { useContext } from "react";
import { AuthContext, type AuthContextType } from "../context/auth-context";

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}