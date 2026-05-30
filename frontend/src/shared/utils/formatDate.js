import { FORMAT_DATE_CONFIG } from "./formatDate.config";

function toValidDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function formatWithOptions(value, options) {
  const date = toValidDate(value);

  if (!date) return FORMAT_DATE_CONFIG.fallback;

  return new Intl.DateTimeFormat(FORMAT_DATE_CONFIG.locale, options).format(
    date,
  );
}

export function formatDateTime(value) {
  return formatWithOptions(value, FORMAT_DATE_CONFIG.dateTime);
}

export function formatDate(value) {
  return formatWithOptions(value, FORMAT_DATE_CONFIG.date);
}
