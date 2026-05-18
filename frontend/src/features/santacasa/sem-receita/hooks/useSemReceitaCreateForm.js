import { useState } from "react";

const INITIAL_FORM = Object.freeze({
  medicamento: "",
  quantidade: "1",
});

function onlyDigits(value, maxLength) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, maxLength);
}

function validateForm(values) {
  const errors = {};

  if (!values.medicamento.trim()) {
    errors.medicamento = "O medicamento é obrigatório.";
  }

  const quantidade = Number(values.quantidade);

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    errors.quantidade = "A quantidade deve ser maior que 0.";
  }

  return errors;
}

function normalizePayload(values) {
  return {
    medicamento: values.medicamento.trim(),
    quantidade: Number(values.quantidade),
  };
}

export function useSemReceitaCreateForm({
  selectedUtenteId,
  onCreate,
  isSubmitting = false,
}) {
  const [values, setValues] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const isDisabled = !selectedUtenteId || isSubmitting;

  function updateField(name, value) {
    setValues((currentValues) => ({
      ...currentValues,
      [name]: name === "quantidade" ? onlyDigits(value, 3) : value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const result = await onCreate(normalizePayload(values));

    if (!result?.ok) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        ...(result?.fieldErrors || {}),
      }));

      return;
    }

    setValues(INITIAL_FORM);
    setErrors({});
  }

  return {
    values,
    errors,
    isDisabled,

    updateField,
    handleSubmit,
  };
}
