import { useState } from "react";

import Button from "../../../../../shared/ui/Button/Button";
import FormField from "../../../../../shared/ui/FormField/FormField";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { SEM_RECEITA_PAGE } from "../../config/semReceitaPage.config";

import styles from "./SemReceitaCreateForm.module.css";

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

export default function SemReceitaCreateForm({
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

  return (
    <SurfaceCard
      title={SEM_RECEITA_PAGE.form.title}
      description={SEM_RECEITA_PAGE.form.description}
      tone="green"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {!selectedUtenteId ? (
          <p className={styles.notice}>
            Seleciona um utente antes de adicionar medicamento.
          </p>
        ) : null}

        <div className={styles.grid}>
          <FormField
            id={SEM_RECEITA_PAGE.fields.medicamento.id}
            label={SEM_RECEITA_PAGE.fields.medicamento.label}
            hint={SEM_RECEITA_PAGE.fields.medicamento.hint}
            error={errors.medicamento}
            required
          >
            <input
              id={SEM_RECEITA_PAGE.fields.medicamento.id}
              type="text"
              placeholder={SEM_RECEITA_PAGE.fields.medicamento.placeholder}
              value={values.medicamento}
              onChange={(event) =>
                updateField("medicamento", event.target.value)
              }
              disabled={isDisabled}
            />
          </FormField>

          <FormField
            id={SEM_RECEITA_PAGE.fields.quantidade.id}
            label={SEM_RECEITA_PAGE.fields.quantidade.label}
            hint={SEM_RECEITA_PAGE.fields.quantidade.hint}
            error={errors.quantidade}
            required
          >
            <input
              id={SEM_RECEITA_PAGE.fields.quantidade.id}
              type="text"
              inputMode="numeric"
              placeholder={SEM_RECEITA_PAGE.fields.quantidade.placeholder}
              value={values.quantidade}
              onChange={(event) =>
                updateField("quantidade", event.target.value)
              }
              disabled={isDisabled}
            />
          </FormField>
        </div>

        <div className={styles.actions}>
          <Button type="submit" isLoading={isSubmitting} disabled={isDisabled}>
            {isSubmitting
              ? SEM_RECEITA_PAGE.form.submittingLabel
              : SEM_RECEITA_PAGE.form.submitLabel}
          </Button>
        </div>
      </form>
    </SurfaceCard>
  );
}
