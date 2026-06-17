import { useCallback, useEffect, useMemo, useState } from "react";

import { getCurrentUser, loginUser, logoutUser } from "../api/authApi";

import { AUTH_MESSAGES, AUTH_ROLES } from "../config/auth.config";

import { useIdleLogout } from "../hooks/useIdleLogout";

import {
  clearLastActivityAt,
  writeLastActivityAt,
} from "../state/authActivity.storage";

import {
  getAuthErrorMessage,
  isForbiddenAuthError,
  isUnauthorizedAuthError,
} from "../utils/authError.utils";

import { AuthContext } from "./AuthContext";

function canAlwaysUpdateState() {
  return true;
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
      if (isUnauthorizedAuthError(authError)) {
        clearSession(AUTH_MESSAGES.sessionExpired);
        return true;
      }

      if (isForbiddenAuthError(authError)) {
        setError(AUTH_MESSAGES.forbidden);
        return true;
      }

      return false;
    },
    [clearSession],
  );

  const loadCurrentUser = useCallback(
    async ({
      showLoading = false,
      canUpdateState = canAlwaysUpdateState,
    } = {}) => {
      if (showLoading && canUpdateState()) {
        setIsLoadingSession(true);
      }

      if (canUpdateState()) {
        setError(null);
      }

      try {
        const response = await getCurrentUser();
        const currentUser = response?.user ?? null;

        if (canUpdateState()) {
          setUser(currentUser);
        }

        return currentUser;
      } catch (refreshError) {
        if (!canUpdateState()) {
          return null;
        }

        setUser(null);

        if (isUnauthorizedAuthError(refreshError)) {
          clearLastActivityAt();
        } else {
          setError(
            getAuthErrorMessage(refreshError, AUTH_MESSAGES.sessionCheckError),
          );
        }

        return null;
      } finally {
        if (canUpdateState()) {
          setIsLoadingSession(false);
        }
      }
    },
    [],
  );

  const refreshUser = useCallback(
    async ({ showLoading = false } = {}) => {
      return loadCurrentUser({
        showLoading,
      });
    },
    [loadCurrentUser],
  );

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

      setError(getAuthErrorMessage(loginError, AUTH_MESSAGES.loginError));

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
      setError(getAuthErrorMessage(logoutError, AUTH_MESSAGES.logoutError));
    } finally {
      clearSession();
      setIsLoggingOut(false);
    }
  }, [clearSession]);

  const logoutByInactivity = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      await logoutUser();
    } catch {
      // Mesmo que o backend falhe, o frontend limpa a sessão local.
    } finally {
      clearSession(AUTH_MESSAGES.sessionExpiredByInactivity);

      setIsLoggingOut(false);
    }
  }, [clearSession]);

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

    const initialSessionTimerId = window.setTimeout(() => {
      void loadCurrentUser({
        canUpdateState: () => isMounted,
      });
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(initialSessionTimerId);
    };
  }, [loadCurrentUser]);

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
