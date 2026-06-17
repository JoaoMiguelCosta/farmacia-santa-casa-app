// src/features/santacasa/receitas/components/ReceitaCreateForm/ReceitaLineFieldset.jsx
import Button from "../../../../../shared/ui/Button/Button";
import FormField from "../../../../../shared/ui/FormField/FormField";

import MedicamentoAutocomplete from "../../../shared/components/MedicamentoAutocomplete/MedicamentoAutocomplete";

import { RECEITAS_PAGE } from "../../config/receitasPage.config";

import styles from "./ReceitaLineFieldset.module.css";

export default function ReceitaLineFieldset({
  linha,
  index,
  totalLines,
  errors,
  isDisabled,
  todayInputValue,
  medicacaoHabitualOptions,
  onRemoveLine,
  onLineChange,
}) {
  const baseId = `receita-linha-${linha.id}`;

  return (
    <fieldset className={styles.line}>
      <legend>
        {RECEITAS_PAGE.form.lineLegendPrefix} {index + 1}
      </legend>

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
          onChange={(value) => onLineChange(index, "medicamento", value)}
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
              onLineChange(index, "quantidade", event.target.value)
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
              onLineChange(index, "validade", event.target.value)
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
          onClick={() => onRemoveLine(index)}
          disabled={isDisabled || totalLines === 1}
        >
          {RECEITAS_PAGE.form.removeLineLabel}
        </Button>
      </div>
    </fieldset>
  );
}
