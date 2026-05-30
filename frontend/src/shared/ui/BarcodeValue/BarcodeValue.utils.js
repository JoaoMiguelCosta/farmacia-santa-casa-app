import { BARCODE_VALUE_CONFIG } from "./BarcodeValue.config";

export function normalizeBarcodeValue(value) {
  return String(value ?? "").trim();
}

export function getBarcodeAriaLabel({ label, value }) {
  if (label) {
    return `${label}: ${value}`;
  }

  return `${BARCODE_VALUE_CONFIG.ariaPrefix} ${value}`;
}
