// src/features/auth/components/AuthHomeRedirect.jsx

import { Navigate } from "react-router-dom";

import { AUTH_REDIRECTS } from "../config/auth.config";
import { useAuth } from "../hooks/useAuth";

import AuthGuardState from "./AuthGuardState/AuthGuardState";
import { AUTH_GUARD_STATE_CONFIG } from "./AuthGuardState/AuthGuardState.config";

function getRedirectPathForRole(role) {
  return AUTH_REDIRECTS.byRole[role] || AUTH_REDIRECTS.login;
}

export default function AuthHomeRedirect() {
  const { isAuthenticated, isLoadingSession, role } = useAuth();

  if (isLoadingSession) {
    return (
      <AuthGuardState
        title={AUTH_GUARD_STATE_CONFIG.homeRedirect.title}
        description={AUTH_GUARD_STATE_CONFIG.homeRedirect.description}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={AUTH_REDIRECTS.login} replace />;
  }

  return <Navigate to={getRedirectPathForRole(role)} replace />;
}
