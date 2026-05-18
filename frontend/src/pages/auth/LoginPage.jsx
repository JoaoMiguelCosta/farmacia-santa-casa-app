import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import {
  AUTH_MESSAGES,
  AUTH_REDIRECTS,
} from "../../features/auth/config/auth.config";
import { useAuth } from "../../features/auth/hooks/useAuth";

import styles from "./LoginPage.module.css";

const LOGIN_PAGE = Object.freeze({
  eyebrow: "Acesso restrito",
  title: "Iniciar sessão",
  description:
    "Utiliza as credenciais fornecidas pelo administrador. Após o login, serás encaminhado automaticamente para a tua área de trabalho.",

  fields: {
    email: {
      label: "Email",
      placeholder: "exemplo@sistema.local",
    },
    password: {
      label: "Password",
      placeholder: "Introduz a tua password",
    },
  },

  actions: {
    submit: "Entrar",
    submitting: "A entrar...",
  },

  feedback: {
    missingFields: "Preenche o email e a password.",
  },
});

const LOGIN_AREAS = ["Santa Casa", "Farmácia", "Sistema/Admin"];

const NOTICE_MESSAGES = new Set([
  AUTH_MESSAGES.loginRequired,
  AUTH_MESSAGES.sessionExpired,
  AUTH_MESSAGES.forbidden,
]);

function getRedirectPathForUser(user, fallbackPath = null) {
  if (fallbackPath) return fallbackPath;

  return AUTH_REDIRECTS.byRole[user?.role] || "/";
}

function isNoticeMessage(message) {
  return NOTICE_MESSAGES.has(message);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    isAuthenticated,
    isLoadingSession,
    isLoggingIn,
    error,
    login,
    clearAuthError,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [localError, setLocalError] = useState(null);
  const [dismissedRouteMessageKey, setDismissedRouteMessageKey] =
    useState(null);

  const routeMessage = location.state?.message || null;
  const routeMessageKey = routeMessage
    ? `${location.key}:${routeMessage}`
    : null;

  const visibleRouteMessage =
    routeMessageKey && dismissedRouteMessageKey !== routeMessageKey
      ? routeMessage
      : null;

  const redirectFrom = useMemo(() => {
    const fromPath = location.state?.from?.pathname;

    if (!fromPath || fromPath === AUTH_REDIRECTS.login) {
      return null;
    }

    return fromPath;
  }, [location.state]);

  const authFeedback = error || visibleRouteMessage;
  const hasAuthFeedback = Boolean(authFeedback);
  const authFeedbackIsNotice = isNoticeMessage(authFeedback);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    navigate(getRedirectPathForUser(user, redirectFrom), {
      replace: true,
    });
  }, [isAuthenticated, navigate, redirectFrom, user]);

  function clearFeedbackMessages() {
    setLocalError(null);

    if (routeMessageKey) {
      setDismissedRouteMessageKey(routeMessageKey);
    }

    clearAuthError();
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
    clearFeedbackMessages();
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    clearFeedbackMessages();
  }

  if (isLoadingSession) {
    return (
      <section className={styles.page} aria-live="polite">
        <div className={styles.card}>
          <p className={styles.loading}>A verificar sessão...</p>
        </div>
      </section>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getRedirectPathForUser(user, redirectFrom)} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    clearFeedbackMessages();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setLocalError(LOGIN_PAGE.feedback.missingFields);
      return;
    }

    try {
      const loggedUser = await login({
        email: trimmedEmail,
        password,
      });

      navigate(getRedirectPathForUser(loggedUser, redirectFrom), {
        replace: true,
      });
    } catch {
      // O AuthProvider já guarda a mensagem de erro.
    }
  }

  return (
    <section className={styles.page} aria-labelledby="login-title">
      <div className={styles.card}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>{LOGIN_PAGE.eyebrow}</p>

          <h1 id="login-title" className={styles.title}>
            {LOGIN_PAGE.title}
          </h1>

          <p className={styles.description}>{LOGIN_PAGE.description}</p>

          <ul className={styles.areaBadges} aria-label="Áreas disponíveis">
            {LOGIN_AREAS.map((area) => (
              <li key={area} className={styles.areaBadge}>
                {area}
              </li>
            ))}
          </ul>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>{LOGIN_PAGE.fields.email.label}</span>

            <input
              type="email"
              value={email}
              placeholder={LOGIN_PAGE.fields.email.placeholder}
              autoComplete="email"
              disabled={isLoggingIn}
              onChange={handleEmailChange}
            />
          </label>

          <label className={styles.field}>
            <span>{LOGIN_PAGE.fields.password.label}</span>

            <input
              type="password"
              value={password}
              placeholder={LOGIN_PAGE.fields.password.placeholder}
              autoComplete="current-password"
              disabled={isLoggingIn}
              onChange={handlePasswordChange}
            />
          </label>

          {hasAuthFeedback ? (
            <p
              className={authFeedbackIsNotice ? styles.notice : styles.error}
              role={authFeedbackIsNotice ? "status" : "alert"}
            >
              {authFeedback}
            </p>
          ) : null}

          {localError ? (
            <p className={styles.error} role="alert">
              {localError}
            </p>
          ) : null}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoggingIn}
          >
            {isLoggingIn
              ? LOGIN_PAGE.actions.submitting
              : LOGIN_PAGE.actions.submit}
          </button>
        </form>
      </div>
    </section>
  );
}
