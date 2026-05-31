// src/features/santacasa/medicacao-habitual/components/MedicacaoHabitualManager/MedicacaoHabitualList.jsx
import { MEDICACAO_HABITUAL_CONFIG } from "../../config/medicacaoHabitual.config";

import MedicacaoHabitualRow from "./MedicacaoHabitualRow";

import styles from "./MedicacaoHabitualList.module.css";

export default function MedicacaoHabitualList({
  medicacoes,
  hasMedicacoes,
  deletingMedicacaoId,
  isBusy,
  onRequestDelete,
}) {
  const section = MEDICACAO_HABITUAL_CONFIG.section;
  const list = MEDICACAO_HABITUAL_CONFIG.list;

  if (!hasMedicacoes) {
    return (
      <div className={styles.emptyState} role="status">
        <strong>{section.emptyTitle}</strong>
        <span>{section.emptyDescription}</span>
      </div>
    );
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="medicacao-habitual-list-title"
    >
      <div className={styles.header}>
        <div>
          <h3 id="medicacao-habitual-list-title">{list.title}</h3>
          <p>{list.description}</p>
        </div>

        <span className={styles.countBadge}>{medicacoes.length}</span>
      </div>

      <div className={styles.list} role="list">
        {medicacoes.map((medicacao) => (
          <MedicacaoHabitualRow
            key={medicacao.id}
            medicacao={medicacao}
            isDeleting={deletingMedicacaoId === medicacao.id}
            isBusy={isBusy}
            onRequestDelete={onRequestDelete}
          />
        ))}
      </div>
    </section>
  );
}
