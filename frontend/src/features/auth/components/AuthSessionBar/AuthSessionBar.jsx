import { Link, useNavigate } from "react-router-dom";

import { AUTH_REDIRECTS, AUTH_ROLES } from "../../config/auth.config";
import { useAuth } from "../../hooks/useAuth";

import styles from "./AuthSessionBar.module.css";

const ROLE_LABELS = Object.freeze({
  [AUTH_ROLES.SANTACASA]: "Santa Casa",
  [AUTH_ROLES.FARMACIA]: "Farmácia",
  [AUTH_ROLES.ADMIN]: "Sistema/Admin",
});

function getRoleLabel(role) {
  return ROLE_LABELS[role] || role || "Utilizador";
}

function getUserHomePath(role) {
  return AUTH_REDIRECTS.byRole[role] || "/";
}

export default function AuthSessionBar() {
  const navigate = useNavigate();

  const {
    user,
    role,
    isAuthenticated,
    isLoadingSession,
    isLoggingOut,
    logout,
  } = useAuth();

  if (isLoadingSession || !isAuthenticated || !user) {
    return null;
  }

  async function handleLogout() {
    await logout();

    navigate(AUTH_REDIRECTS.login, {
      replace: true,
    });
  }

  const roleLabel = getRoleLabel(role);
  const homePath = getUserHomePath(role);

  return (
    <section className={styles.bar} aria-label="Sessão do utilizador">
      <div className={styles.inner}>
        <div className={styles.identity}>
          <span className={styles.statusDot} aria-hidden="true" />

          <div className={styles.userText}>
            <span className={styles.label}>Sessão ativa</span>

            <strong className={styles.name}>{user.name}</strong>

            <span className={styles.meta}>
              {roleLabel}
              {user.email ? ` · ${user.email}` : ""}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <Link className={styles.areaLink} to={homePath}>
            Ir para a minha área
          </Link>

          <button
            type="button"
            className={styles.logoutButton}
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            {isLoggingOut ? "A terminar..." : "Terminar sessão"}
          </button>
        </div>
      </div>
    </section>
  );
}
