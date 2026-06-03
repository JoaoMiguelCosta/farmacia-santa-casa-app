// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacoesList/SantaCasaRegularizacoesPendingGroup.jsx

import SantaCasaRegularizacaoCard from "../SantaCasaRegularizacaoCard/SantaCasaRegularizacaoCard";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import styles from "./SantaCasaRegularizacoesList.module.css";

import {
  getHiddenMedicamentosLabel,
  getRegularizacoesPendentesCountLabel,
  getUnidadesLabel,
  getViewMoreMedicamentosLabel,
} from "./santaCasaRegularizacoesList.utils";

export default function SantaCasaRegularizacoesPendingGroup({
  group,
  isOpen,
  visibleCount,
  onToggle,
  onShowMore,
  onShowAll,
  variant = "pending",
}) {
  const panelId = `santacasa-regularizacoes-group-${group.key}`;
  const totalMedicamentos = group.regularizacoes.length;
  const safeVisibleCount = Math.min(visibleCount, totalMedicamentos);
  const visibleRegularizacoes = group.regularizacoes.slice(0, safeVisibleCount);

  const hasHiddenMedicamentos = safeVisibleCount < totalMedicamentos;
  const hiddenMedicamentosCount = totalMedicamentos - safeVisibleCount;

  return (
    <article className={styles.group}>
      <header className={styles.groupHeader}>
        <div className={styles.groupIdentity}>
          <span className={styles.groupEyebrow}>
            {SANTACASA_REGULARIZACOES_PAGE.labels.utente}
          </span>

          <strong className={styles.groupTitle}>{group.utenteNome}</strong>

          <span className={styles.groupDescription}>
            {SANTACASA_REGULARIZACOES_PAGE.labels.utenteNumber}:{" "}
            {group.utenteNumero}
          </span>
        </div>

        <dl className={styles.groupStats}>
          <div>
            <dt>
              {SANTACASA_REGULARIZACOES_PAGE.labels.regularizacoesPendentes}
            </dt>
            <dd>{getRegularizacoesPendentesCountLabel(totalMedicamentos)}</dd>
          </div>

          <div>
            <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.quantidadeRestante}</dt>
            <dd>{getUnidadesLabel(group.totalRestante)}</dd>
          </div>
        </dl>

        <button
          type="button"
          className={styles.groupButton}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        >
          {isOpen
            ? SANTACASA_REGULARIZACOES_PAGE.actions.hideMedicamentos
            : SANTACASA_REGULARIZACOES_PAGE.actions.viewMedicamentos}
        </button>
      </header>

      {isOpen ? (
        <div id={panelId} className={styles.groupContent}>
          <div className={styles.groupList}>
            {visibleRegularizacoes.map((regularizacao) => (
              <SantaCasaRegularizacaoCard
                key={regularizacao.id}
                regularizacao={regularizacao}
                variant={variant}
                isGrouped
              />
            ))}
          </div>

          <footer className={styles.groupPagination}>
            <span className={styles.groupPaginationInfo}>
              {hasHiddenMedicamentos
                ? getHiddenMedicamentosLabel(hiddenMedicamentosCount)
                : "Todos os medicamentos deste utente estão visíveis."}
            </span>

            <div className={styles.groupPaginationActions}>
              {hasHiddenMedicamentos ? (
                <>
                  <button
                    type="button"
                    className={styles.groupSecondaryButton}
                    onClick={onShowMore}
                  >
                    {getViewMoreMedicamentosLabel(hiddenMedicamentosCount)}
                  </button>

                  <button
                    type="button"
                    className={styles.groupSecondaryButton}
                    onClick={onShowAll}
                  >
                    {SANTACASA_REGULARIZACOES_PAGE.actions.viewAllMedicamentos}
                  </button>
                </>
              ) : null}

              <button
                type="button"
                className={styles.groupSecondaryButton}
                onClick={onToggle}
              >
                {SANTACASA_REGULARIZACOES_PAGE.actions.hideMedicamentos}
              </button>
            </div>
          </footer>
        </div>
      ) : null}
    </article>
  );
}
