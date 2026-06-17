// src/features/santacasa/receitas/components/ReceitaCreateForm/ReceitaCreateForm.jsx
import Button from "../../../../../shared/ui/Button/Button";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { RECEITAS_PAGE } from "../../config/receitasPage.config";
import { useReceitaCreateForm } from "../../hooks/useReceitaCreateForm";

import ReceitaCodeFields from "./ReceitaCodeFields";
import ReceitaLinesSection from "./ReceitaLinesSection";

import styles from "./ReceitaCreateForm.module.css";

export default function ReceitaCreateForm({
  selectedUtenteId,
  onCreate,
  isSubmitting = false,
  resetKey = 0,
  medicacaoHabitualOptions = [],
}) {
  const {
    values,
    errors,

    todayInputValue,
    isDisabled,

    updateField,
    updateLine,
    addLine,
    removeLine,
    handleSubmit,
  } = useReceitaCreateForm({
    selectedUtenteId,
    onCreate,
    isSubmitting,
    resetKey,
  });

  return (
    <SurfaceCard
      title={RECEITAS_PAGE.form.title}
      description={RECEITAS_PAGE.form.description}
      tone="green"
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {!selectedUtenteId ? (
          <p className={styles.notice} role="status">
            {RECEITAS_PAGE.form.noUtenteSelectedMessage}
          </p>
        ) : null}

        <ReceitaCodeFields
          values={values}
          errors={errors}
          isDisabled={isDisabled}
          onFieldChange={updateField}
        />

        <ReceitaLinesSection
          linhas={values.linhas}
          errors={errors}
          isDisabled={isDisabled}
          todayInputValue={todayInputValue}
          medicacaoHabitualOptions={medicacaoHabitualOptions}
          onAddLine={addLine}
          onRemoveLine={removeLine}
          onLineChange={updateLine}
        />

        <div className={styles.actions}>
          <Button type="submit" isLoading={isSubmitting} disabled={isDisabled}>
            {isSubmitting
              ? RECEITAS_PAGE.form.submittingLabel
              : RECEITAS_PAGE.form.submitLabel}
          </Button>
        </div>
      </form>
    </SurfaceCard>
  );
}
