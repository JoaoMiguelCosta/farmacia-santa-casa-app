// src/features/santacasa/medicacao-habitual/components/MedicacaoHabitualManager/MedicacaoHabitualRow.jsx
import Button from "../../../../../shared/ui/Button/Button";
import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { MEDICACAO_HABITUAL_CONFIG } from "../../config/medicacaoHabitual.config";

import styles from "./MedicacaoHabitualRow.module.css";

export default function MedicacaoHabitualRow({
  medicacao,
  isDeleting,
  isBusy,
  onRequestDelete,
}) {
  const list = MEDICACAO_HABITUAL_CONFIG.list;

  return (
    <article className={styles.item} role="listitem">
      <div className={styles.medicationCell}>
        <span>{list.itemLabel}</span>
        <strong>{medicacao.medicamento}</strong>
      </div>

      <div className={styles.metaCell}>
        <span>{list.createdAtLabel}</span>
        <strong>{formatDateTime(medicacao.createdAt)}</strong>
      </div>

      <div className={styles.actionCell}>
        <Button
          type="button"
          variant="danger"
          size="sm"
          isLoading={isDeleting}
          disabled={isBusy}
          aria-label={`${list.removeAriaLabelPrefix} ${medicacao.medicamento} da medicação habitual`}
          onClick={() => onRequestDelete(medicacao)}
        >
          {isDeleting ? list.removingLabel : list.removeLabel}
        </Button>
      </div>
    </article>
  );
}
