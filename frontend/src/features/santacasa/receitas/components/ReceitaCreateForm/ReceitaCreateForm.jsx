import Button from "../../../../../shared/ui/Button/Button";
import FormField from "../../../../../shared/ui/FormField/FormField";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import MedicamentoAutocomplete from "../../../medicacao-habitual/components/MedicamentoAutocomplete/MedicamentoAutocomplete";

import { RECEITAS_PAGE } from "../../config/receitasPage.config";
import { useReceitaCreateForm } from "../../hooks/useReceitaCreateForm";

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
            Seleciona um utente antes de criar receita.
          </p>
        ) : null}

        <div className={styles.recipeGrid}>
          <FormField
            id={RECEITAS_PAGE.fields.numero19.id}
            label={RECEITAS_PAGE.fields.numero19.label}
            hint={RECEITAS_PAGE.fields.numero19.hint}
            error={errors.numero19}
            required
          >
            <input
              id={RECEITAS_PAGE.fields.numero19.id}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={RECEITAS_PAGE.fields.numero19.placeholder}
              value={values.numero19}
              onChange={(event) => updateField("numero19", event.target.value)}
              disabled={isDisabled}
              autoComplete="off"
            />
          </FormField>

          <FormField
            id={RECEITAS_PAGE.fields.pinAcesso6.id}
            label={RECEITAS_PAGE.fields.pinAcesso6.label}
            hint={RECEITAS_PAGE.fields.pinAcesso6.hint}
            error={errors.pinAcesso6}
            required
          >
            <input
              id={RECEITAS_PAGE.fields.pinAcesso6.id}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={RECEITAS_PAGE.fields.pinAcesso6.placeholder}
              value={values.pinAcesso6}
              onChange={(event) =>
                updateField("pinAcesso6", event.target.value)
              }
              disabled={isDisabled}
              autoComplete="off"
            />
          </FormField>

          <FormField
            id={RECEITAS_PAGE.fields.pinOpcao4.id}
            label={RECEITAS_PAGE.fields.pinOpcao4.label}
            hint={RECEITAS_PAGE.fields.pinOpcao4.hint}
            error={errors.pinOpcao4}
            required
          >
            <input
              id={RECEITAS_PAGE.fields.pinOpcao4.id}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={RECEITAS_PAGE.fields.pinOpcao4.placeholder}
              value={values.pinOpcao4}
              onChange={(event) => updateField("pinOpcao4", event.target.value)}
              disabled={isDisabled}
              autoComplete="off"
            />
          </FormField>
        </div>

        <div className={styles.linesHeader}>
          <div className={styles.linesTitleGroup}>
            <p>Composição</p>
            <h3>Linhas da receita</h3>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addLine}
            disabled={isDisabled}
          >
            {RECEITAS_PAGE.form.addLineLabel}
          </Button>
        </div>

        <div className={styles.lines}>
          {values.linhas.map((linha, index) => {
            const baseId = `receita-linha-${linha.id}`;

            return (
              <fieldset key={linha.id} className={styles.line}>
                <legend>Linha {index + 1}</legend>

                <div className={styles.lineGrid}>
                  <MedicamentoAutocomplete
                    id={`${baseId}-medicamento`}
                    label={RECEITAS_PAGE.fields.medicamento.label}
                    placeholder={RECEITAS_PAGE.fields.medicamento.placeholder}
                    value={linha.medicamento}
                    options={medicacaoHabitualOptions}
                    error={errors[`linhas.${index}.medicamento`]}
                    disabled={isDisabled}
                    required
                    onChange={(value) =>
                      updateLine(index, "medicamento", value)
                    }
                  />

                  <FormField
                    id={`${baseId}-quantidade`}
                    label={RECEITAS_PAGE.fields.quantidade.label}
                    error={errors[`linhas.${index}.quantidade`]}
                    required
                  >
                    <input
                      id={`${baseId}-quantidade`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder={RECEITAS_PAGE.fields.quantidade.placeholder}
                      value={linha.quantidade}
                      onChange={(event) =>
                        updateLine(index, "quantidade", event.target.value)
                      }
                      disabled={isDisabled}
                      autoComplete="off"
                    />
                  </FormField>

                  <FormField
                    id={`${baseId}-validade`}
                    label={RECEITAS_PAGE.fields.validade.label}
                    error={errors[`linhas.${index}.validade`]}
                    required
                  >
                    <input
                      id={`${baseId}-validade`}
                      type="date"
                      min={todayInputValue}
                      value={linha.validade}
                      onChange={(event) =>
                        updateLine(index, "validade", event.target.value)
                      }
                      disabled={isDisabled}
                    />
                  </FormField>
                </div>

                <div className={styles.lineActions}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(index)}
                    disabled={isDisabled || values.linhas.length === 1}
                  >
                    {RECEITAS_PAGE.form.removeLineLabel}
                  </Button>
                </div>
              </fieldset>
            );
          })}
        </div>

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
