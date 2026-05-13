import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";
import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { UTENTES_PAGE } from "../../config/utentesPage.config";

import styles from "./UtentesList.module.css";

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
          <thead>
            <tr>
              <th>Utente</th>
              <th>Número</th>
              <th>Estado</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {utentes.map((utente) => {
              const isDeleting = deletingUtenteId === utente.id;

              return (
                <tr key={utente.id}>
                  <td>
                    <strong>{utente.nome}</strong>
                    <span>{utente.id}</span>
                  </td>

                  <td>{utente.numero9}</td>

                  <td>
                    <span className={styles.status}>
                      {utente.isValid ? "Ativo" : "Inválido"}
                    </span>
                  </td>

                  <td>{formatDateTime(utente.createdAt)}</td>

                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={isDeleting}
                      disabled={Boolean(deletingUtenteId)}
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
