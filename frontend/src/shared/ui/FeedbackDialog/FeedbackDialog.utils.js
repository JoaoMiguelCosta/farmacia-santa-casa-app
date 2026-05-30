import { FEEDBACK_DIALOG_CONFIG } from "./FeedbackDialog.config";

export function getSafeFeedbackDialogType(type) {
  if (
    Object.prototype.hasOwnProperty.call(FEEDBACK_DIALOG_CONFIG.types, type)
  ) {
    return type;
  }

  return FEEDBACK_DIALOG_CONFIG.fallbackType;
}

export function getFeedbackDialogCopy(type) {
  const dialogType = getSafeFeedbackDialogType(type);

  return FEEDBACK_DIALOG_CONFIG.types[dialogType];
}
