import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface GuestRouteProps {
  children: ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (isAuthenticated) {
    return <Navigate to="/tasks" replace />;
  }

  return children;
}