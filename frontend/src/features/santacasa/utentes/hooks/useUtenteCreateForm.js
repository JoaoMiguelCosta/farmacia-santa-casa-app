import { useState } from "react";

import {
  UTENTE_CREATE_INITIAL_FORM,
  hasFormErrors,
  normalizeUtenteCreateFieldValue,
  normalizeUtenteCreatePayload,
  validateUtenteCreateForm,
} from "../utils/utentesForm.utils";

export function useUtenteCreateForm({ onCreate }) {
  const [values, setValues] = useState(UTENTE_CREATE_INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  function updateField(name, value) {
    setValues((currentValues) => ({
      ...currentValues,
      [name]: normalizeUtenteCreateFieldValue(name, value),
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setSubmitError(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateUtenteCreateForm(values);

    if (hasFormErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    setSubmitError(null);

    const result = await onCreate?.(normalizeUtenteCreatePayload(values));

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

    setValues(UTENTE_CREATE_INITIAL_FORM);
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
