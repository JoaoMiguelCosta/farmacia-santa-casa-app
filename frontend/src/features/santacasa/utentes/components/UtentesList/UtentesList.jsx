// src/features/santacasa/utentes/components/UtentesList/UtentesList.jsx
import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { UTENTES_PAGE } from "../../config/utentesPage.config";

import {
  getUtenteActionAriaLabel,
  getUtenteArchiveDetails,
  getUtenteDateLabel,
  getUtenteStatusLabel,
  getUtenteStatusVariant,
  isUtenteArchived,
} from "../../utils/utentesList.utils";

import styles from "./UtentesList.module.css";

const STATUS_CLASS_BY_VARIANT = Object.freeze({
  active: "active",
  archived: "archived",
  invalid: "invalid",
});

function getStatusClassName(utente) {
  const variant = getUtenteStatusVariant(utente);
  const variantClass = STATUS_CLASS_BY_VARIANT[variant] || "invalid";

  return `${styles.status} ${styles[variantClass]}`;
}

export default function UtentesList({
  utentes = [],
  isLoading = false,
  error = null,
  deletingUtenteId = null,
  archivingUtenteId = null,
  reactivatingUtenteId = null,
  onRetry,
  onDelete,
  onArchive,
  onReactivate,
}) {
  const isAnyActionRunning = Boolean(
    deletingUtenteId || archivingUtenteId || reactivatingUtenteId,
  );

  if (isLoading) {
    return (
      <DataState
        type="loading"
        title={UTENTES_PAGE.list.loadingTitle}
        description={UTENTES_PAGE.list.loadingDescription}
      />
    );
  }

  if (error) {
    return (
      <DataState
        type="error"
        title={UTENTES_PAGE.list.errorTitle}
        description={error}
        actionLabel={UTENTES_PAGE.list.retryLabel}
        onAction={onRetry}
      />
    );
  }

  if (utentes.length === 0) {
    return (
      <DataState
        type="empty"
        title={UTENTES_PAGE.list.emptyTitle}
        description={UTENTES_PAGE.list.emptyDescription}
      />
    );
  }

  return (
    <SurfaceCard
      title={UTENTES_PAGE.list.title}
      description={UTENTES_PAGE.list.description}
      tone="strong"
    >
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>
            {UTENTES_PAGE.list.caption}
          </caption>

          <thead>
            <tr>
              <th scope="col">{UTENTES_PAGE.list.columns.utente}</th>
              <th scope="col">{UTENTES_PAGE.list.columns.numero}</th>
              <th scope="col">{UTENTES_PAGE.list.columns.estado}</th>
              <th scope="col">{UTENTES_PAGE.list.columns.dataMotivo}</th>
              <th scope="col">{UTENTES_PAGE.list.columns.acoes}</th>
            </tr>
          </thead>

          <tbody>
            {utentes.map((utente) => {
              const isDeleting = deletingUtenteId === utente.id;
              const isArchiving = archivingUtenteId === utente.id;
              const isReactivating = reactivatingUtenteId === utente.id;

              const isArchived = isUtenteArchived(utente);
              const archiveDetails = getUtenteArchiveDetails(utente);

              return (
                <tr key={utente.id}>
                  <td className={styles.identityCell}>
                    <strong>{utente.nome}</strong>
                  </td>

                  <td>
                    <span className={styles.numberValue}>{utente.numero9}</span>
                  </td>

                  <td>
                    <span className={getStatusClassName(utente)}>
                      {getUtenteStatusLabel(utente)}
                    </span>
                  </td>

                  <td>
                    <span className={styles.dateValue}>
                      {getUtenteDateLabel(utente)}
                    </span>

                    {archiveDetails ? (
                      <span className={styles.reasonValue}>
                        {archiveDetails}
                      </span>
                    ) : null}
                  </td>

                  <td className={styles.actionCell}>
                    <div className={styles.actions}>
                      {isArchived ? (
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            isLoading={isReactivating}
                            disabled={isAnyActionRunning}
                            aria-label={getUtenteActionAriaLabel(
                              UTENTES_PAGE.list.ariaLabels.reactivatePrefix,
                              utente,
                            )}
                            onClick={() => onReactivate?.(utente)}
                          >
                            {isReactivating
                              ? UTENTES_PAGE.list.reactivatingLabel
                              : UTENTES_PAGE.list.reactivateLabel}
                          </Button>

                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            isLoading={isDeleting}
                            disabled={isAnyActionRunning}
                            aria-label={getUtenteActionAriaLabel(
                              UTENTES_PAGE.list.ariaLabels.deletePrefix,
                              utente,
                            )}
                            onClick={() => onDelete?.(utente)}
                          >
                            {isDeleting
                              ? UTENTES_PAGE.list.deletingLabel
                              : UTENTES_PAGE.list.deleteLabel}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            isLoading={isArchiving}
                            disabled={isAnyActionRunning}
                            aria-label={getUtenteActionAriaLabel(
                              UTENTES_PAGE.list.ariaLabels.archivePrefix,
                              utente,
                            )}
                            onClick={() => onArchive?.(utente)}
                          >
                            {isArchiving
                              ? UTENTES_PAGE.list.archivingLabel
                              : UTENTES_PAGE.list.archiveLabel}
                          </Button>

                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            isLoading={isDeleting}
                            disabled={isAnyActionRunning}
                            aria-label={getUtenteActionAriaLabel(
                              UTENTES_PAGE.list.ariaLabels.deletePrefix,
                              utente,
                            )}
                            onClick={() => onDelete?.(utente)}
                          >
                            {isDeleting
                              ? UTENTES_PAGE.list.deletingLabel
                              : UTENTES_PAGE.list.deleteLabel}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}
