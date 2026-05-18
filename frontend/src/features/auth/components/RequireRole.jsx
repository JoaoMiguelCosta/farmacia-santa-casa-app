import { Navigate, useLocation } from "react-router-dom";

import { AUTH_MESSAGES, AUTH_REDIRECTS } from "../config/auth.config";
import { useAuth } from "../hooks/useAuth";

import styles from "./AuthGuardState.module.css";

function normalizeAllowedRoles(allowedRoles = []) {
  if (Array.isArray(allowedRoles)) return allowedRoles;

  return [allowedRoles].filter(Boolean);
}

function getRedirectPathForRole(role) {
  return AUTH_REDIRECTS.byRole[role] || "/";
}

function AuthGuardState({ title, description }) {
  return (
    <section className={styles.guard} aria-live="polite">
      <div className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
    </section>
  );
}

export default function RequireRole({ allowedRoles = [], children }) {
  const location = useLocation();

  const { user, role, isLoadingSession, error } = useAuth();

  const roles = normalizeAllowedRoles(allowedRoles);

  if (isLoadingSession) {
    return (
      <AuthGuardState
        title={AUTH_MESSAGES.loadingSession}
        description="Aguarda enquanto confirmamos as permissões da tua conta."
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
