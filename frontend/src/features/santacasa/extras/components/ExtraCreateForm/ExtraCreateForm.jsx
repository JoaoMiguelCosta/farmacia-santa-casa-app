import { useState } from "react";

import Button from "../../../../../shared/ui/Button/Button";
import FormField from "../../../../../shared/ui/FormField/FormField";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { EXTRAS_PAGE } from "../../config/extrasPage.config";

import styles from "./ExtraCreateForm.module.css";

const INITIAL_FORM = Object.freeze({
  medicamento: "",
  quantidadeSolicitada: "1",
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

  const quantidadeSolicitada = Number(values.quantidadeSolicitada);

  if (!Number.isInteger(quantidadeSolicitada) || quantidadeSolicitada <= 0) {
    errors.quantidadeSolicitada =
      "A quantidade solicitada deve ser maior que 0.";
  }

  return errors;
}

function normalizePayload(values) {
  return {
    medicamento: values.medicamento.trim(),
    quantidadeSolicitada: Number(values.quantidadeSolicitada),
  };
}

export default function ExtraCreateForm({
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
      [name]: name === "quantidadeSolicitada" ? onlyDigits(value, 3) : value,
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

  return (
    <SurfaceCard
      title={EXTRAS_PAGE.form.title}
      description={EXTRAS_PAGE.form.description}
      tone="green"
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {!selectedUtenteId ? (
          <p className={styles.notice} role="status">
            Seleciona um utente antes de criar Extra.
          </p>
        ) : null}

        <div className={styles.grid}>
          <FormField
            id={EXTRAS_PAGE.fields.medicamento.id}
            label={EXTRAS_PAGE.fields.medicamento.label}
            hint={EXTRAS_PAGE.fields.medicamento.hint}
            error={errors.medicamento}
            required
          >
            <input
              id={EXTRAS_PAGE.fields.medicamento.id}
              type="text"
              placeholder={EXTRAS_PAGE.fields.medicamento.placeholder}
              value={values.medicamento}
              onChange={(event) =>
                updateField("medicamento", event.target.value)
              }
              disabled={isDisabled}
              autoComplete="off"
            />
          </FormField>

          <FormField
            id={EXTRAS_PAGE.fields.quantidadeSolicitada.id}
            label={EXTRAS_PAGE.fields.quantidadeSolicitada.label}
            hint={EXTRAS_PAGE.fields.quantidadeSolicitada.hint}
            error={errors.quantidadeSolicitada}
            required
          >
            <input
              id={EXTRAS_PAGE.fields.quantidadeSolicitada.id}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={EXTRAS_PAGE.fields.quantidadeSolicitada.placeholder}
              value={values.quantidadeSolicitada}
              onChange={(event) =>
                updateField("quantidadeSolicitada", event.target.value)
              }
              disabled={isDisabled}
              autoComplete="off"
            />
          </FormField>
        </div>

        <div className={styles.actions}>
          <Button type="submit" isLoading={isSubmitting} disabled={isDisabled}>
            {isSubmitting
              ? EXTRAS_PAGE.form.submittingLabel
              : EXTRAS_PAGE.form.submitLabel}
          </Button>
        </div>
      </form>
    </SurfaceCard>
  );
}
