// src/shared/layouts/AppShell/AppShell.utils.js

import { AUTH_ROLES } from "../../../features/auth/config/auth.config";

export function getVisibleNavItems({ items = [], isAuthenticated, role }) {
  return items.filter((item) => {
    if (item.publicOnly) {
      return !isAuthenticated;
    }

    if (item.authOnly) {
      return isAuthenticated;
    }

    if (!Array.isArray(item.allowedRoles)) {
      return true;
    }

    return isAuthenticated && item.allowedRoles.includes(role);
  });
}

export function getPrimaryNavItems({
  items = [],
  areaItems = {},
  isAuthenticated,
  role,
}) {
  if (!isAuthenticated) {
    return [];
  }

  if (role === AUTH_ROLES.ADMIN) {
    return getVisibleNavItems({
      items,
      isAuthenticated,
      role,
    });
  }

  const currentAreaItem = areaItems[role];

  return currentAreaItem ? [currentAreaItem] : [];
}

export function isSantaCasaPath(pathname = "") {
  return pathname === "/santacasa" || pathname.startsWith("/santacasa/");
}

export function isFarmaciaPath(pathname = "") {
  return pathname === "/farmacia" || pathname.startsWith("/farmacia/");
}

export function isSystemPath(pathname = "") {
  return pathname === "/sistema" || pathname.startsWith("/sistema/");
}

export function canSeeSantaCasaSectionNav({ isAuthenticated, role }) {
  return (
    isAuthenticated && [AUTH_ROLES.SANTACASA, AUTH_ROLES.ADMIN].includes(role)
  );
}

export function canSeeFarmaciaSectionNav({ isAuthenticated, role }) {
  return (
    isAuthenticated && [AUTH_ROLES.FARMACIA, AUTH_ROLES.ADMIN].includes(role)
  );
}

export function canSeeSystemSectionNav({ isAuthenticated, role }) {
  return isAuthenticated && role === AUTH_ROLES.ADMIN;
}

export function canSeeFarmaciaAlertas({ isAuthenticated, role }) {
  return (
    isAuthenticated && [AUTH_ROLES.FARMACIA, AUTH_ROLES.ADMIN].includes(role)
  );
}
