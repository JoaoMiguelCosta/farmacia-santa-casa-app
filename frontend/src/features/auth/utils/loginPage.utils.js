import { AUTH_MESSAGES, AUTH_REDIRECTS } from "../config/auth.config";

const NOTICE_MESSAGES = new Set([
  AUTH_MESSAGES.loginRequired,
  AUTH_MESSAGES.sessionExpired,
  AUTH_MESSAGES.sessionExpiredByInactivity,
  AUTH_MESSAGES.forbidden,
]);

export function getLoginRedirectFrom(locationState) {
  const fromPath = locationState?.from?.pathname;

  if (!fromPath || fromPath === AUTH_REDIRECTS.login) {
    return null;
  }

  return fromPath;
}

export function getLoginRedirectPath(user, fallbackPath = null) {
  if (fallbackPath) {
    return fallbackPath;
  }

  return AUTH_REDIRECTS.byRole[user?.role] || "/";
}

export function getLoginRouteMessageKey(locationKey, routeMessage) {
  if (!routeMessage) {
    return null;
  }

  return `${locationKey}:${routeMessage}`;
}

export function isLoginNoticeMessage(message) {
  return NOTICE_MESSAGES.has(message);
}
