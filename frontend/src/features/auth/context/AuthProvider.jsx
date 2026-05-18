import { useCallback, useEffect, useMemo, useState } from "react";

import { getCurrentUser, loginUser, logoutUser } from "../api/authApi";
import { AUTH_MESSAGES, AUTH_ROLES } from "../config/auth.config";
import { useIdleLogout } from "../hooks/useIdleLogout";
import {
  clearLastActivityAt,
  writeLastActivityAt,
} from "../state/authActivity.storage";
import { AuthContext } from "./AuthContext";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function isUnauthorizedError(error) {
  return error?.isUnauthorized || error?.status === 401;
}

function isForbiddenError(error) {
  return error?.isForbidden || error?.status === 403;
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [error, setError] = useState(null);

  const clearSession = useCallback((message = null) => {
    setUser(null);
    clearLastActivityAt();

    if (message) {
      setError(message);
    }
  }, []);

  const handleAuthError = useCallback(
    (authError) => {
      if (isUnauthorizedError(authError)) {
        clearSession(AUTH_MESSAGES.sessionExpired);
        return true;
      }

      if (isForbiddenError(authError)) {
        setError(AUTH_MESSAGES.forbidden);
        return true;
      }

      return false;
    },
    [clearSession],
  );

  const refreshUser = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setIsLoadingSession(true);
    }

    setError(null);

    try {
      const response = await getCurrentUser();
      const currentUser = response?.user ?? null;

      setUser(currentUser);

      return currentUser;
    } catch (refreshError) {
      setUser(null);

      if (isUnauthorizedError(refreshError)) {
        clearLastActivityAt();
      } else {
        setError(
          getErrorMessage(refreshError, "Não foi possível verificar a sessão."),
        );
      }

      return null;
    } finally {
      setIsLoadingSession(false);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setIsLoggingIn(true);
    setError(null);

    try {
      const response = await loginUser({
        email,
        password,
      });

      const loggedUser = response?.user ?? null;

      writeLastActivityAt();
      setUser(loggedUser);

      return loggedUser;
    } catch (loginError) {
      setUser(null);
      clearLastActivityAt();

      const message = getErrorMessage(loginError, AUTH_MESSAGES.loginError);

      setError(message);

      throw loginError;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      await logoutUser();
    } catch (logoutError) {
      setError(getErrorMessage(logoutError, AUTH_MESSAGES.logoutError));
    } finally {
      setUser(null);
      clearLastActivityAt();
      setIsLoggingOut(false);
    }
  }, []);

  const logoutByInactivity = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      await logoutUser();
    } catch {
      // Mesmo que o backend falhe, o frontend deve limpar a sessão local.
    } finally {
      setUser(null);
      clearLastActivityAt();
      setError(AUTH_MESSAGES.sessionExpiredByInactivity);
      setIsLoggingOut(false);
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setError(null);
  }, []);

  const {
    isWarningVisible: isIdleWarningVisible,
    warningBeforeMs: idleWarningBeforeMs,
    resetIdleTimer,
    dismissIdleWarning: dismissIdleWarningBase,
  } = useIdleLogout({
    enabled: Boolean(user) && !isLoadingSession && !isLoggingOut,
    onTimeout: logoutByInactivity,
  });

  const dismissIdleWarning = useCallback(() => {
    clearAuthError();
    dismissIdleWarningBase();
  }, [clearAuthError, dismissIdleWarningBase]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialSession() {
      try {
        const response = await getCurrentUser();
        const currentUser = response?.user ?? null;

        if (!isMounted) return;

        setUser(currentUser);
      } catch (refreshError) {
        if (!isMounted) return;

        setUser(null);

        if (isUnauthorizedError(refreshError)) {
          clearLastActivityAt();
        } else {
          setError(
            getErrorMessage(
              refreshError,
              "Não foi possível verificar a sessão.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingSession(false);
        }
      }
    }

    loadInitialSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(() => {
    const role = user?.role ?? null;

    return {
      user,
      role,

      isAuthenticated: Boolean(user),
      isLoadingSession,
      isLoggingIn,
      isLoggingOut,
      isBusy: isLoadingSession || isLoggingIn || isLoggingOut,

      isSantaCasa: role === AUTH_ROLES.SANTACASA,
      isFarmacia: role === AUTH_ROLES.FARMACIA,
      isAdmin: role === AUTH_ROLES.ADMIN,

      error,

      isIdleWarningVisible,
      idleWarningBeforeMs,

      login,
      logout,
      refreshUser,
      clearSession,
      handleAuthError,
      clearAuthError,

      resetIdleTimer,
      dismissIdleWarning,
    };
  }, [
    user,
    isLoadingSession,
    isLoggingIn,
    isLoggingOut,
    error,
    isIdleWarningVisible,
    idleWarningBeforeMs,
    login,
    logout,
    refreshUser,
    clearSession,
    handleAuthError,
    clearAuthError,
    resetIdleTimer,
    dismissIdleWarning,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
