// src/features/santacasa/utentes/hooks/useUtenteCreateForm.js
import { useState } from "react";

const INITIAL_FORM = Object.freeze({
  numero9: "",
  nome: "",
});

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function validateForm(values) {
  const errors = {};

  if (!/^\d{9}$/.test(values.numero9)) {
    errors.numero9 = "O número deve ter exatamente 9 dígitos.";
  }

  if (!values.nome.trim()) {
    errors.nome = "O nome é obrigatório.";
  }

  return errors;
}

function normalizePayload(values) {
  return {
    numero9: values.numero9,
    nome: values.nome.trim(),
  };
}

export function useUtenteCreateForm({ onCreate }) {
  const [values, setValues] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  function updateField(name, value) {
    setValues((currentValues) => ({
      ...currentValues,
      [name]: name === "numero9" ? onlyDigits(value).slice(0, 9) : value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setSubmitError(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitError(null);

    const result = await onCreate?.(normalizePayload(values));

    if (!result?.ok) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        ...(result?.fieldErrors || {}),
      }));

      if (result?.message) {
        setSubmitError(result.message);
      }

      return;
    }

    setValues(INITIAL_FORM);
    setErrors({});
    setSubmitError(null);
  }

  return {
    values,
    errors,
    submitError,

    updateField,
    handleSubmit,
  };
}
