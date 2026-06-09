// src/shared/utils/date.js
function getStartOfDay(value = new Date()) {
  const date = new Date(value);

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isValidDate(value) {
  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

function isDateBeforeDay(value, reference = new Date()) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date < getStartOfDay(reference);
}

function isDateBeforeToday(value, now = new Date()) {
  return isDateBeforeDay(value, now);
}

module.exports = {
  getStartOfDay,
  isDateBeforeDay,
  isDateBeforeToday,
  isValidDate,
};
