import { useState } from "react";

import Button from "../../../../../shared/ui/Button/Button";
import FormField from "../../../../../shared/ui/FormField/FormField";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { UTENTES_PAGE } from "../../config/utentesPage.config";

import styles from "./UtenteCreateForm.module.css";

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

export default function UtenteCreateForm({ onCreate, isSubmitting = false }) {
  const [values, setValues] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  function updateField(name, value) {
    setValues((currentValues) => ({
      ...currentValues,
      [name]: name === "numero9" ? onlyDigits(value).slice(0, 9) : value,
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

    await onCreate({
      numero9: values.numero9,
      nome: values.nome.trim(),
    });

    setValues(INITIAL_FORM);
    setErrors({});
  }

  return (
    <SurfaceCard
      title={UTENTES_PAGE.form.title}
      description={UTENTES_PAGE.form.description}
      tone="green"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <FormField
            id={UTENTES_PAGE.fields.numero9.id}
            label={UTENTES_PAGE.fields.numero9.label}
            hint={UTENTES_PAGE.fields.numero9.hint}
            error={errors.numero9}
            required
          >
            <input
              id={UTENTES_PAGE.fields.numero9.id}
              name="numero9"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder={UTENTES_PAGE.fields.numero9.placeholder}
              value={values.numero9}
              onChange={(event) => updateField("numero9", event.target.value)}
            />
          </FormField>

          <FormField
            id={UTENTES_PAGE.fields.nome.id}
            label={UTENTES_PAGE.fields.nome.label}
            hint={UTENTES_PAGE.fields.nome.hint}
            error={errors.nome}
            required
          >
            <input
              id={UTENTES_PAGE.fields.nome.id}
              name="nome"
              type="text"
              autoComplete="name"
              placeholder={UTENTES_PAGE.fields.nome.placeholder}
              value={values.nome}
              onChange={(event) => updateField("nome", event.target.value)}
            />
          </FormField>
        </div>

        <div className={styles.actions}>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting
              ? UTENTES_PAGE.form.submittingLabel
              : UTENTES_PAGE.form.submitLabel}
          </Button>
        </div>
      </form>
    </SurfaceCard>
  );
}
