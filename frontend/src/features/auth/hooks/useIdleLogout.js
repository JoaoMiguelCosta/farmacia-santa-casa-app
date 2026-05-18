import { useCallback, useEffect, useRef, useState } from "react";

import { AUTH_SESSION_CONFIG } from "../config/auth.config";
import {
  readLastActivityAt,
  writeLastActivityAt,
} from "../state/authActivity.storage";

const EVENT_OPTIONS = {
  passive: true,
};

function isVisibilityActivity(event) {
  if (event?.type !== "visibilitychange") return true;

  return document.visibilityState === "visible";
}

function getElapsedSinceLastActivity() {
  const lastActivityAt = readLastActivityAt();

  if (!lastActivityAt) return null;

  return Date.now() - lastActivityAt;
}

export function useIdleLogout({ enabled = false, onWarning, onTimeout } = {}) {
  const [isWarningVisible, setIsWarningVisible] = useState(false);

  const warningTimerRef = useRef(null);
  const timeoutTimerRef = useRef(null);
  const effectStartTimerRef = useRef(null);
  const timeoutTriggeredRef = useRef(false);

  const onWarningRef = useRef(onWarning);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onWarningRef.current = onWarning;
  }, [onWarning]);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const clearEffectStartTimer = useCallback(() => {
    if (effectStartTimerRef.current) {
      window.clearTimeout(effectStartTimerRef.current);
      effectStartTimerRef.current = null;
    }
  }, []);

  const clearIdleTimers = useCallback(() => {
    if (warningTimerRef.current) {
      window.clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }

    if (timeoutTimerRef.current) {
      window.clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
  }, []);

  const triggerTimeout = useCallback(() => {
    if (timeoutTriggeredRef.current) return;

    timeoutTriggeredRef.current = true;

    clearIdleTimers();
    setIsWarningVisible(false);

    onTimeoutRef.current?.();
  }, [clearIdleTimers]);

  const startIdleTimers = useCallback(() => {
    clearIdleTimers();

    if (!enabled) {
      setIsWarningVisible(false);
      return;
    }

    let elapsed = getElapsedSinceLastActivity();

    if (elapsed === null) {
      writeLastActivityAt();
      elapsed = 0;
    }

    if (elapsed >= AUTH_SESSION_CONFIG.idleTimeoutMs) {
      triggerTimeout();
      return;
    }

    timeoutTriggeredRef.current = false;

    const remainingTime = AUTH_SESSION_CONFIG.idleTimeoutMs - elapsed;
    const warningDelay = Math.max(
      0,
      remainingTime - AUTH_SESSION_CONFIG.warningBeforeMs,
    );

    if (warningDelay === 0) {
      setIsWarningVisible(true);
      onWarningRef.current?.();
    } else {
      setIsWarningVisible(false);

      warningTimerRef.current = window.setTimeout(() => {
        setIsWarningVisible(true);
        onWarningRef.current?.();
      }, warningDelay);
    }

    timeoutTimerRef.current = window.setTimeout(() => {
      triggerTimeout();
    }, remainingTime);
  }, [clearIdleTimers, enabled, triggerTimeout]);

  const resetIdleTimer = useCallback(() => {
    timeoutTriggeredRef.current = false;
    writeLastActivityAt();
    setIsWarningVisible(false);
    startIdleTimers();
  }, [startIdleTimers]);

  const handleActivity = useCallback(
    (event) => {
      if (!enabled) return;
      if (!isVisibilityActivity(event)) return;

      const elapsed = getElapsedSinceLastActivity();

      if (elapsed !== null && elapsed >= AUTH_SESSION_CONFIG.idleTimeoutMs) {
        triggerTimeout();
        return;
      }

      resetIdleTimer();
    },
    [enabled, resetIdleTimer, triggerTimeout],
  );

  useEffect(() => {
    clearEffectStartTimer();

    if (!enabled) {
      clearIdleTimers();

      return () => {
        clearEffectStartTimer();
      };
    }

    effectStartTimerRef.current = window.setTimeout(() => {
      effectStartTimerRef.current = null;
      startIdleTimers();
    }, 0);

    AUTH_SESSION_CONFIG.activityEvents.forEach((eventName) => {
      const target = eventName === "visibilitychange" ? document : window;

      target.addEventListener(eventName, handleActivity, EVENT_OPTIONS);
    });

    return () => {
      AUTH_SESSION_CONFIG.activityEvents.forEach((eventName) => {
        const target = eventName === "visibilitychange" ? document : window;

        target.removeEventListener(eventName, handleActivity, EVENT_OPTIONS);
      });

      clearEffectStartTimer();
      clearIdleTimers();
    };
  }, [
    clearEffectStartTimer,
    clearIdleTimers,
    enabled,
    handleActivity,
    startIdleTimers,
  ]);

  return {
    isWarningVisible: enabled && isWarningVisible,
    warningBeforeMs: AUTH_SESSION_CONFIG.warningBeforeMs,

    resetIdleTimer,
    clearIdleTimers,
    dismissIdleWarning: resetIdleTimer,
  };
}
