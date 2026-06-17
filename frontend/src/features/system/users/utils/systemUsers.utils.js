// src/features/system/users/utils/systemUsers.utils.js
import {
  SYSTEM_USERS_PAGE,
  SYSTEM_USERS_ROLES,
} from "../config/systemUsersPage.config";

const UNKNOWN_LABEL = "—";
const MIN_PASSWORD_LENGTH = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SYSTEM_USERS_DEFAULT_FILTERS = Object.freeze({
  search: "",
  role: "",
  isActive: "",
  skip: 0,
  take: 50,
});

export const SYSTEM_USERS_DEFAULT_FORM = Object.freeze({
  name: "",
  email: "",
  role: SYSTEM_USERS_ROLES.SANTACASA,
  password: "",
});

export const SYSTEM_USERS_ROLE_OPTIONS = Object.freeze([
  {
    value: SYSTEM_USERS_ROLES.SANTACASA,
    label: SYSTEM_USERS_PAGE.roles.SANTACASA,
  },
  {
    value: SYSTEM_USERS_ROLES.FARMACIA,
    label: SYSTEM_USERS_PAGE.roles.FARMACIA,
  },
  {
    value: SYSTEM_USERS_ROLES.ADMIN,
    label: SYSTEM_USERS_PAGE.roles.ADMIN,
  },
]);

export const SYSTEM_USERS_STATUS_OPTIONS = Object.freeze([
  {
    value: "",
    label: SYSTEM_USERS_PAGE.filters.isActive.all,
  },
  {
    value: "true",
    label: SYSTEM_USERS_PAGE.filters.isActive.active,
  },
  {
    value: "false",
    label: SYSTEM_USERS_PAGE.filters.isActive.inactive,
  },
]);

function toText(value) {
  return String(value || "").trim();
}

function toNonNegativeInteger(value, fallback = 0) {
  const parsed = Math.floor(Number(value));

  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

function toPositiveInteger(value, fallback = 50) {
  const parsed = Math.floor(Number(value));

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function normalizeEmail(value) {
  return toText(value).toLowerCase();
}

export function getSystemUserRoleLabel(role) {
  return SYSTEM_USERS_PAGE.roles[role] || role || UNKNOWN_LABEL;
}

export function getSystemUserStatusLabel(isActive) {
  return isActive
    ? SYSTEM_USERS_PAGE.status.active
    : SYSTEM_USERS_PAGE.status.inactive;
}

export function isValidSystemUserRole(role) {
  return Object.values(SYSTEM_USERS_ROLES).includes(role);
}

export function isValidSystemUserEmail(email) {
  return EMAIL_PATTERN.test(normalizeEmail(email));
}

export function isCurrentSystemUser(user, currentUser) {
  if (!user?.id || !currentUser?.id) return false;

  return user.id === currentUser.id;
}

export function canChangeSystemUserRole(user, currentUser) {
  return !isCurrentSystemUser(user, currentUser);
}

export function normalizeSystemUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name || UNKNOWN_LABEL,
    email: user.email || UNKNOWN_LABEL,
    role: user.role || null,
    roleLabel: getSystemUserRoleLabel(user.role),
    isActive: Boolean(user.isActive),
    statusLabel: getSystemUserStatusLabel(Boolean(user.isActive)),
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
  };
}

export function normalizeSystemUsersResponse(response) {
  const rows = Array.isArray(response?.data) ? response.data : [];

  return {
    users: rows.map(normalizeSystemUser).filter(Boolean),
    meta: {
      total: Number(response?.meta?.total || 0),
      skip: Number(response?.meta?.skip || 0),
      take: Number(response?.meta?.take || rows.length || 50),
    },
  };
}

export function buildSystemUsersQuery(filters = {}) {
  const search = toText(filters.search);
  const role = toText(filters.role).toUpperCase();
  const isActive = toText(filters.isActive);
  const skip = toNonNegativeInteger(
    filters.skip,
    SYSTEM_USERS_DEFAULT_FILTERS.skip,
  );
  const take = toPositiveInteger(
    filters.take,
    SYSTEM_USERS_DEFAULT_FILTERS.take,
  );

  return {
    skip,
    take,
    ...(search ? { search } : {}),
    ...(role ? { role } : {}),
    ...(isActive ? { isActive } : {}),
  };
}

export function buildCreateSystemUserPayload(values = {}) {
  return {
    name: toText(values.name),
    email: normalizeEmail(values.email),
    password: String(values.password || ""),
    role: toText(values.role).toUpperCase(),
  };
}

export function buildUpdateSystemUserPayload(values = {}) {
  return {
    name: toText(values.name),
    email: normalizeEmail(values.email),
    role: toText(values.role).toUpperCase(),
  };
}

export function buildUpdateSystemUserPasswordPayload(values = {}) {
  return {
    password: String(values.password || ""),
  };
}

export function buildUpdateSystemUserStatusPayload(isActive) {
  return {
    isActive: Boolean(isActive),
  };
}

export function buildSystemUserFormFromUser(user) {
  return {
    name: user?.name || "",
    email: user?.email || "",
    role: isValidSystemUserRole(user?.role)
      ? user.role
      : SYSTEM_USERS_ROLES.SANTACASA,
    password: "",
  };
}

export function validateCreateSystemUserForm(values = {}) {
  const payload = buildCreateSystemUserPayload(values);

  if (!payload.name || !payload.email || !payload.password || !payload.role) {
    return SYSTEM_USERS_PAGE.feedback.missingRequiredFields;
  }

  if (!isValidSystemUserEmail(payload.email)) {
    return SYSTEM_USERS_PAGE.feedback.invalidEmail;
  }

  if (payload.password.length < MIN_PASSWORD_LENGTH) {
    return SYSTEM_USERS_PAGE.feedback.passwordMinLength;
  }

  if (!isValidSystemUserRole(payload.role)) {
    return SYSTEM_USERS_PAGE.feedback.invalidRole;
  }

  return null;
}

export function validateUpdateSystemUserForm(values = {}) {
  const payload = buildUpdateSystemUserPayload(values);

  if (!payload.name || !payload.email || !payload.role) {
    return SYSTEM_USERS_PAGE.feedback.missingRequiredFields;
  }

  if (!isValidSystemUserEmail(payload.email)) {
    return SYSTEM_USERS_PAGE.feedback.invalidEmail;
  }

  if (!isValidSystemUserRole(payload.role)) {
    return SYSTEM_USERS_PAGE.feedback.invalidRole;
  }

  return null;
}

export function validatePasswordForm(values = {}) {
  const password = String(values.password || "");

  if (!password) {
    return SYSTEM_USERS_PAGE.feedback.passwordRequired;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return SYSTEM_USERS_PAGE.feedback.passwordMinLength;
  }

  return null;
}

export function validateSelfRoleChange({
  selectedUser,
  currentUser,
  nextRole,
} = {}) {
  if (!isCurrentSystemUser(selectedUser, currentUser)) return null;

  if (selectedUser?.role === nextRole) return null;

  return SYSTEM_USERS_PAGE.feedback.selfRoleChangeBlocked;
}

export function canToggleSystemUserStatus(user, currentUser) {
  if (!user?.id || !currentUser?.id) return false;

  return user.id !== currentUser.id;
}

export function getSystemUsersErrorMessage(error) {
  return error?.message || SYSTEM_USERS_PAGE.feedback.genericError;
}
