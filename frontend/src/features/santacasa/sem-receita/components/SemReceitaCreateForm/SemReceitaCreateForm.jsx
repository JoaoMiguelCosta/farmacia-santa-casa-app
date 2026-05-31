// src/features/santacasa/sem-receita/components/SemReceitaCreateForm/SemReceitaCreateForm.jsx
import Button from "../../../../../shared/ui/Button/Button";
import FormField from "../../../../../shared/ui/FormField/FormField";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import MedicamentoAutocomplete from "../../../medicacao-habitual/components/MedicamentoAutocomplete/MedicamentoAutocomplete";

import { SEM_RECEITA_PAGE } from "../../config/semReceitaPage.config";
import { useSemReceitaCreateForm } from "../../hooks/useSemReceitaCreateForm";

import styles from "./SemReceitaCreateForm.module.css";

export default function SemReceitaCreateForm({
  selectedUtenteId,
  onCreate,
  isSubmitting = false,
  medicacaoHabitualOptions = [],
}) {
  const {
    values,
    errors,
    isDisabled,

    updateField,
    handleSubmit,
  } = useSemReceitaCreateForm({
    selectedUtenteId,
    onCreate,
    isSubmitting,
  });

  return (
    <SurfaceCard
      title={SEM_RECEITA_PAGE.form.title}
      description={SEM_RECEITA_PAGE.form.description}
      tone="green"
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {!selectedUtenteId ? (
          <p className={styles.notice} role="status">
            {SEM_RECEITA_PAGE.form.noUtenteSelectedMessage}
          </p>
        ) : null}

        <div className={styles.grid}>
          <MedicamentoAutocomplete
            id={SEM_RECEITA_PAGE.fields.medicamento.id}
            label={SEM_RECEITA_PAGE.fields.medicamento.label}
            hint={SEM_RECEITA_PAGE.fields.medicamento.hint}
            placeholder={SEM_RECEITA_PAGE.fields.medicamento.placeholder}
            value={values.medicamento}
            options={medicacaoHabitualOptions}
            error={errors.medicamento}
            disabled={isDisabled}
            required
            onChange={(value) => updateField("medicamento", value)}
          />

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
              pattern="[0-9]*"
              placeholder={SEM_RECEITA_PAGE.fields.quantidade.placeholder}
              value={values.quantidade}
              onChange={(event) =>
                updateField("quantidade", event.target.value)
              }
              disabled={isDisabled}
              autoComplete="off"
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
