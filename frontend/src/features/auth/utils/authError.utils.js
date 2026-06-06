export function getAuthErrorMessage(error, fallbackMessage) {
  return error?.message || fallbackMessage;
}

export function isUnauthorizedAuthError(error) {
  return Boolean(error?.isUnauthorized || error?.status === 401);
}

export function isForbiddenAuthError(error) {
  return Boolean(error?.isForbidden || error?.status === 403);
}
