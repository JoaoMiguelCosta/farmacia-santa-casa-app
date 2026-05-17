import { Navigate, useLocation } from "react-router-dom";

import { AUTH_REDIRECTS, AUTH_MESSAGES } from "../config/auth.config";
import { useAuth } from "../hooks/useAuth";

import styles from "./AuthGuardState.module.css";

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

export default function RequireAuth({ children }) {
  const location = useLocation();

  const { isAuthenticated, isLoadingSession } = useAuth();

  if (isLoadingSession) {
    return (
      <AuthGuardState
        title={AUTH_MESSAGES.loadingSession}
        description="Aguarda enquanto confirmamos se tens sessão ativa."
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
        }}
      />
    );
  }

  return children;
}
