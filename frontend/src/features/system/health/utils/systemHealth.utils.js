import { formatDateTime } from "../../../../shared/utils/formatDate";

import { SYSTEM_HEALTH_CONFIG } from "../config/systemHealth.config";

export function formatPayload(payload) {
  if (!payload) return SYSTEM_HEALTH_CONFIG.labels.unavailable;

  return JSON.stringify(payload, null, 2);
}

export function getStatusLabel(status) {
  return SYSTEM_HEALTH_CONFIG.status[status] || status;
}

export function getCheckedAtLabel(value) {
  if (!value) return SYSTEM_HEALTH_CONFIG.labels.unavailable;

  return formatDateTime(value);
}
