import { useCallback, useEffect, useMemo, useState } from "react";

import { getCurrentUser, loginUser, logoutUser } from "../api/authApi";
import { AUTH_ROLES } from "../config/auth.config";
import { AuthContext } from "./AuthContext";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function isUnauthorizedError(error) {
  return error?.status === 401 || error?.status === 403;
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [error, setError] = useState(null);

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

      if (!isUnauthorizedError(refreshError)) {
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

      setUser(loggedUser);

      return loggedUser;
    } catch (loginError) {
      setUser(null);

      const message = getErrorMessage(
        loginError,
        "Não foi possível iniciar sessão.",
      );

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
      setError(
        getErrorMessage(logoutError, "Não foi possível terminar sessão."),
      );
    } finally {
      setUser(null);
      setIsLoggingOut(false);
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setError(null);
  }, []);

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

        if (!isUnauthorizedError(refreshError)) {
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

      login,
      logout,
      refreshUser,
      clearAuthError,
    };
  }, [
    user,
    isLoadingSession,
    isLoggingIn,
    isLoggingOut,
    error,
    login,
    logout,
    refreshUser,
    clearAuthError,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
