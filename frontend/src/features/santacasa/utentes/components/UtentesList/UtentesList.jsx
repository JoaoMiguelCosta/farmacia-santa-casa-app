import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";
import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { UTENTES_PAGE } from "../../config/utentesPage.config";

import styles from "./UtentesList.module.css";

function getStatusClassName(isValid) {
  return isValid
    ? `${styles.status} ${styles.active}`
    : `${styles.status} ${styles.invalid}`;
}

export default function UtentesList({
  utentes = [],
  isLoading = false,
  error = null,
  deletingUtenteId = null,
  onRetry,
  onDelete,
}) {
  if (isLoading) {
    return (
      <DataState
        type="loading"
        title={UTENTES_PAGE.list.loadingTitle}
        description="Aguarda enquanto os dados são carregados."
      />
    );
  }

  if (error) {
    return (
      <DataState
        type="error"
        title={UTENTES_PAGE.list.errorTitle}
        description={error}
        actionLabel="Tentar novamente"
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
            Lista de utentes registados
          </caption>

          <thead>
            <tr>
              <th scope="col">Utente</th>
              <th scope="col">Número</th>
              <th scope="col">Estado</th>
              <th scope="col">Criado em</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>

          <tbody>
            {utentes.map((utente) => {
              const isDeleting = deletingUtenteId === utente.id;
              const isValid = Boolean(utente.isValid);

              return (
                <tr key={utente.id}>
                  <td className={styles.identityCell}>
                    <strong>{utente.nome}</strong>
                    <span>{utente.id}</span>
                  </td>

                  <td>
                    <span className={styles.numberValue}>{utente.numero9}</span>
                  </td>

                  <td>
                    <span className={getStatusClassName(isValid)}>
                      {isValid ? "Ativo" : "Inválido"}
                    </span>
                  </td>

                  <td>
                    <span className={styles.dateValue}>
                      {formatDateTime(utente.createdAt)}
                    </span>
                  </td>

                  <td className={styles.actionCell}>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      isLoading={isDeleting}
                      disabled={Boolean(deletingUtenteId)}
                      aria-label={`Remover utente ${utente.nome}`}
                      onClick={() => onDelete?.(utente)}
                    >
                      {isDeleting
                        ? UTENTES_PAGE.list.deletingLabel
                        : UTENTES_PAGE.list.deleteLabel}
                    </Button>
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
