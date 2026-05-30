// src/features/auth/components/AuthSessionBar/AuthSessionBar.jsx
import { useNavigate } from "react-router-dom";

import AppSessionBar from "../../../../shared/layouts/AppShell/components/AppSessionBar/AppSessionBar";

import { AUTH_REDIRECTS } from "../../config/auth.config";
import { useAuth } from "../../hooks/useAuth";

import { AUTH_SESSION_BAR_CONFIG } from "./AuthSessionBar.config";

function getRoleLabel(role) {
  return (
    AUTH_SESSION_BAR_CONFIG.roleLabels[role] ||
    role ||
    AUTH_SESSION_BAR_CONFIG.labels.fallbackRole
  );
}

function getSessionMeta({ roleLabel, email }) {
  return email ? `${roleLabel} · ${email}` : roleLabel;
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

  return (
    <AppSessionBar
      ariaLabel={AUTH_SESSION_BAR_CONFIG.ariaLabel}
      activeLabel={AUTH_SESSION_BAR_CONFIG.labels.activeSession}
      userName={user.name}
      meta={getSessionMeta({
        roleLabel,
        email: user.email,
      })}
      logoutLabel={
        isLoggingOut
          ? AUTH_SESSION_BAR_CONFIG.labels.loggingOut
          : AUTH_SESSION_BAR_CONFIG.labels.logout
      }
      isLoggingOut={isLoggingOut}
      onLogout={handleLogout}
    />
  );
}
