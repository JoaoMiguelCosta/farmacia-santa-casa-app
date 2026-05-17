import { Navigate } from "react-router-dom";

import { AUTH_REDIRECTS, AUTH_MESSAGES } from "../config/auth.config";
import { useAuth } from "../hooks/useAuth";

import styles from "./AuthGuardState.module.css";

function getRedirectPathForRole(role) {
  return AUTH_REDIRECTS.byRole[role] || AUTH_REDIRECTS.login;
}

export default function AuthHomeRedirect() {
  const { isAuthenticated, isLoadingSession, role } = useAuth();

  if (isLoadingSession) {
    return (
      <section className={styles.guard} aria-live="polite">
        <div className={styles.card}>
          <h1 className={styles.title}>{AUTH_MESSAGES.loadingSession}</h1>
          <p className={styles.description}>
            A aguardar confirmação da sessão.
          </p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={AUTH_REDIRECTS.login} replace />;
  }

  return <Navigate to={getRedirectPathForRole(role)} replace />;
}
