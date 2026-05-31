// src/features/santacasa/receitas/components/ReceitaCreateForm/ReceitaLinesSection.jsx
import Button from "../../../../../shared/ui/Button/Button";

import { RECEITAS_PAGE } from "../../config/receitasPage.config";

import ReceitaLineFieldset from "./ReceitaLineFieldset";

import styles from "./ReceitaLinesSection.module.css";

export default function ReceitaLinesSection({
  linhas,
  errors,
  isDisabled,
  todayInputValue,
  medicacaoHabitualOptions,
  onAddLine,
  onRemoveLine,
  onLineChange,
}) {
  return (
    <>
      <div className={styles.linesHeader}>
        <div className={styles.linesTitleGroup}>
          <p>{RECEITAS_PAGE.form.compositionEyebrow}</p>
          <h3>{RECEITAS_PAGE.form.linesTitle}</h3>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onAddLine}
          disabled={isDisabled}
        >
          {RECEITAS_PAGE.form.addLineLabel}
        </Button>
      </div>

      <div className={styles.lines}>
        {linhas.map((linha, index) => (
          <ReceitaLineFieldset
            key={linha.id}
            linha={linha}
            index={index}
            totalLines={linhas.length}
            errors={errors}
            isDisabled={isDisabled}
            todayInputValue={todayInputValue}
            medicacaoHabitualOptions={medicacaoHabitualOptions}
            onRemoveLine={onRemoveLine}
            onLineChange={onLineChange}
          />
        ))}
      </div>
    </>
  );
}
