// src/features/auth/components/RequireAuth.jsx

import { Navigate, useLocation } from "react-router-dom";

import { AUTH_MESSAGES, AUTH_REDIRECTS } from "../config/auth.config";
import { useAuth } from "../hooks/useAuth";

import AuthGuardState from "./AuthGuardState/AuthGuardState";
import { AUTH_GUARD_STATE_CONFIG } from "./AuthGuardState/AuthGuardState.config";

export default function RequireAuth({ children }) {
  const location = useLocation();

  const { isAuthenticated, isLoadingSession, error } = useAuth();

  if (isLoadingSession) {
    return (
      <AuthGuardState
        title={AUTH_GUARD_STATE_CONFIG.authentication.title}
        description={AUTH_GUARD_STATE_CONFIG.authentication.description}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={AUTH_REDIRECTS.login}
        replace
        state={{
          from: location,
          message: error || AUTH_MESSAGES.loginRequired,
        }}
      />
    );
  }

  return children;
}
