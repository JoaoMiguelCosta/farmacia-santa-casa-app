// src/features/santacasa/utentes/utils/utentesForm.utils.js
import { UTENTES_PAGE } from "../config/utentesPage.config";

export const UTENTE_CREATE_INITIAL_FORM = Object.freeze({
  numero9: "",
  nome: "",
});

export function onlyDigits(value, maxLength) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, maxLength);
}

export function normalizeUtenteCreateFieldValue(name, value) {
  if (name === "numero9") {
    return onlyDigits(value, 9);
  }

  return value;
}

export function validateUtenteCreateForm(values) {
  const errors = {};

  if (!/^\d{9}$/.test(values.numero9)) {
    errors.numero9 = UTENTES_PAGE.form.errors.numero9Invalid;
  }

  if (!values.nome.trim()) {
    errors.nome = UTENTES_PAGE.form.errors.nomeRequired;
  }

  return errors;
}

export function normalizeUtenteCreatePayload(values) {
  return {
    numero9: values.numero9,
    nome: values.nome.trim(),
  };
}

export function hasFormErrors(errors) {
  return Object.keys(errors).length > 0;
}
