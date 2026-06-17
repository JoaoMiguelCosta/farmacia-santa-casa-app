import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { LOGIN_PAGE_CONFIG } from "../config/loginPage.config";
import { useAuth } from "./useAuth";

import {
  getLoginRedirectFrom,
  getLoginRedirectPath,
  getLoginRouteMessageKey,
  isLoginNoticeMessage,
} from "../utils/loginPage.utils";

const INITIAL_INVALID_FIELDS = Object.freeze({
  email: false,
  password: false,
});

export function useLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

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

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [invalidFields, setInvalidFields] = useState(INITIAL_INVALID_FIELDS);

  const [localError, setLocalError] = useState(null);

  const [dismissedRouteMessageKey, setDismissedRouteMessageKey] =
    useState(null);

  const routeMessage = location.state?.message || null;

  const routeMessageKey = getLoginRouteMessageKey(location.key, routeMessage);

  const visibleRouteMessage =
    routeMessageKey && dismissedRouteMessageKey !== routeMessageKey
      ? routeMessage
      : null;

  const redirectFrom = useMemo(() => {
    return getLoginRedirectFrom(location.state);
  }, [location.state]);

  const redirectPath = getLoginRedirectPath(user, redirectFrom);

  const authFeedback = error || visibleRouteMessage;

  const hasAuthFeedback = Boolean(authFeedback);

  const authFeedbackIsNotice = isLoginNoticeMessage(authFeedback);

  function clearFeedbackMessages() {
    setLocalError(null);

    if (routeMessageKey) {
      setDismissedRouteMessageKey(routeMessageKey);
    }

    clearAuthError();
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);

    setInvalidFields((currentFields) => {
      if (!currentFields.email) {
        return currentFields;
      }

      return {
        ...currentFields,
        email: false,
      };
    });

    clearFeedbackMessages();
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);

    setInvalidFields((currentFields) => {
      if (!currentFields.password) {
        return currentFields;
      }

      return {
        ...currentFields,
        password: false,
      };
    });

    clearFeedbackMessages();
  }

  function handlePasswordVisibilityToggle() {
    setIsPasswordVisible((currentValue) => !currentValue);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    clearFeedbackMessages();

    const trimmedEmail = email.trim();

    const nextInvalidFields = {
      email: !trimmedEmail,
      password: !password,
    };

    if (nextInvalidFields.email || nextInvalidFields.password) {
      setInvalidFields(nextInvalidFields);
      setLocalError(LOGIN_PAGE_CONFIG.feedback.missingFields);

      if (nextInvalidFields.email) {
        emailInputRef.current?.focus();
      } else {
        passwordInputRef.current?.focus();
      }

      return;
    }

    setInvalidFields(INITIAL_INVALID_FIELDS);

    try {
      const loggedUser = await login({
        email: trimmedEmail,
        password,
      });

      navigate(getLoginRedirectPath(loggedUser, redirectFrom), {
        replace: true,
      });
    } catch {
      // O AuthProvider guarda e disponibiliza a mensagem de erro.
    }
  }

  return {
    email,
    password,

    emailInputRef,
    passwordInputRef,

    user,
    isAuthenticated,
    isLoadingSession,
    isLoggingIn,
    isPasswordVisible,

    invalidFields,
    redirectPath,

    authFeedback,
    hasAuthFeedback,
    authFeedbackIsNotice,
    localError,

    handleEmailChange,
    handlePasswordChange,
    handlePasswordVisibilityToggle,
    handleSubmit,
  };
}
