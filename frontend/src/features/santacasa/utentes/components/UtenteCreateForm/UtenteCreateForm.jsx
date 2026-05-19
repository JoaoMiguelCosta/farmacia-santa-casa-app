// src/features/santacasa/utentes/components/UtenteCreateForm/UtenteCreateForm.jsx
import Button from "../../../../../shared/ui/Button/Button";
import FormField from "../../../../../shared/ui/FormField/FormField";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { UTENTES_PAGE } from "../../config/utentesPage.config";
import { useUtenteCreateForm } from "../../hooks/useUtenteCreateForm";

import styles from "./UtenteCreateForm.module.css";

export default function UtenteCreateForm({ onCreate, isSubmitting = false }) {
  const { values, errors, submitError, updateField, handleSubmit } =
    useUtenteCreateForm({
      onCreate,
    });

  return (
    <SurfaceCard
      title={UTENTES_PAGE.form.title}
      description={UTENTES_PAGE.form.description}
      tone="green"
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
              pattern="[0-9]*"
              maxLength={9}
              autoComplete="off"
              placeholder={UTENTES_PAGE.fields.numero9.placeholder}
              value={values.numero9}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              onChange={(event) => updateField("nome", event.target.value)}
            />
          </FormField>
        </div>

        {submitError ? (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        ) : null}

        <div className={styles.actions}>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? UTENTES_PAGE.form.submittingLabel
              : UTENTES_PAGE.form.submitLabel}
          </Button>
        </div>
      </form>
    </SurfaceCard>
  );
}
