import { useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

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

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function useUtenteCreateForm({ onCreate }) {
  const { handleAuthError } = useAuth();

  const [values, setValues] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onCreate?.(normalizePayload(values));

      setValues(INITIAL_FORM);
      setErrors({});
    } catch (createError) {
      if (handleAuthError(createError)) return;

      setSubmitError(
        getErrorMessage(createError, "Não foi possível criar o utente."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    values,
    errors,
    submitError,
    isSubmitting,

    updateField,
    handleSubmit,
  };
}
