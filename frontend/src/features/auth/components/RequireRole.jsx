// src/features/auth/components/RequireRole.jsx

import { Navigate, useLocation } from "react-router-dom";

import { AUTH_MESSAGES, AUTH_REDIRECTS } from "../config/auth.config";
import { useAuth } from "../hooks/useAuth";

import AuthGuardState from "./AuthGuardState/AuthGuardState";
import { AUTH_GUARD_STATE_CONFIG } from "./AuthGuardState/AuthGuardState.config";

function normalizeAllowedRoles(allowedRoles = []) {
  if (Array.isArray(allowedRoles)) {
    return allowedRoles;
  }

  return [allowedRoles].filter(Boolean);
}

function getRedirectPathForRole(role) {
  return AUTH_REDIRECTS.byRole[role] || "/";
}

export default function RequireRole({ allowedRoles = [], children }) {
  const location = useLocation();

  const { user, role, isLoadingSession, error } = useAuth();

  const roles = normalizeAllowedRoles(allowedRoles);

  if (isLoadingSession) {
    return (
      <AuthGuardState
        title={AUTH_GUARD_STATE_CONFIG.permissions.title}
        description={AUTH_GUARD_STATE_CONFIG.permissions.description}
      />
    );
  }

  if (!user) {
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

  if (roles.length > 0 && !roles.includes(role)) {
    return (
      <Navigate
        to={getRedirectPathForRole(role)}
        replace
        state={{
          message: AUTH_MESSAGES.forbidden,
        }}
      />
    );
  }

  return children;
}
