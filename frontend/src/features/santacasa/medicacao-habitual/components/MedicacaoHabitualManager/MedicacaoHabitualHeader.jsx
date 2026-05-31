// src/features/santacasa/medicacao-habitual/components/MedicacaoHabitualManager/MedicacaoHabitualHeader.jsx
import Button from "../../../../../shared/ui/Button/Button";

import { MEDICACAO_HABITUAL_CONFIG } from "../../config/medicacaoHabitual.config";

import styles from "./MedicacaoHabitualHeader.module.css";

export default function MedicacaoHabitualHeader({
  selectedUtente,
  hasMedicacoes,
  isRefreshing,
  isBusy,
  onRefresh,
  onClear,
}) {
  const context = MEDICACAO_HABITUAL_CONFIG.context;
  const actions = MEDICACAO_HABITUAL_CONFIG.actions;
  const list = MEDICACAO_HABITUAL_CONFIG.list;

  return (
    <div className={styles.header}>
      <div className={styles.context}>
        <span className={styles.contextLabel}>
          {context.selectedUtenteLabel}
        </span>

        <div className={styles.contextDetails}>
          <div className={styles.contextField}>
            <span>{context.nameLabel}</span>
            <strong>
              {selectedUtente?.nome || context.selectedUtenteFallback}
            </strong>
          </div>

          <div className={styles.contextField}>
            <span>{context.numberLabel}</span>
            <strong>{selectedUtente?.numero9 || context.numberFallback}</strong>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          isLoading={isRefreshing}
          disabled={isRefreshing || isBusy}
          onClick={onRefresh}
        >
          {isRefreshing ? actions.refreshingLabel : actions.refreshLabel}
        </Button>

        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={!hasMedicacoes || isBusy}
          onClick={onClear}
        >
          {list.clearLabel}
        </Button>
      </div>
    </div>
  );
}
