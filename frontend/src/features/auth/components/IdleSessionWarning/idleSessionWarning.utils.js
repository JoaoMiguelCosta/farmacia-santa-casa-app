// src/features/auth/components/IdleSessionWarning/idleSessionWarning.utils.js

export function formatIdleSessionDuration(milliseconds) {
  const parsedMilliseconds = Number(milliseconds);

  const totalSeconds =
    Number.isFinite(parsedMilliseconds) && parsedMilliseconds > 0
      ? Math.ceil(parsedMilliseconds / 1000)
      : 0;

  const unit = totalSeconds === 1 ? "segundo" : "segundos";

  return `${totalSeconds} ${unit}`;
}
