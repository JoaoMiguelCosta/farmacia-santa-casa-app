import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";
import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { SEM_RECEITA_PAGE } from "../../config/semReceitaPage.config";

import styles from "./SemReceitaList.module.css";

export default function SemReceitaList({
  items = [],
  selectedUtenteId = "",
  selectedUtente = null,
  isLoading = false,
  error = null,
  deletingItemId = null,
  onRetry,
  onDelete,
}) {
  if (!selectedUtenteId) {
    return (
      <DataState
        type="empty"
        title="Seleciona um utente."
        description="Depois de selecionares um utente, os medicamentos sem receita aparecem aqui."
      />
    );
  }

  if (isLoading) {
    return (
      <DataState
        type="loading"
        title={SEM_RECEITA_PAGE.list.loadingTitle}
        description="Aguarda enquanto os medicamentos são carregados."
      />
    );
  }

  if (error) {
    return (
      <DataState
        type="error"
        title={SEM_RECEITA_PAGE.list.errorTitle}
        description={error}
        actionLabel="Tentar novamente"
        onAction={onRetry}
      />
    );
  }

  if (items.length === 0) {
    return (
      <DataState
        type="empty"
        title={SEM_RECEITA_PAGE.list.emptyTitle}
        description={SEM_RECEITA_PAGE.list.emptyDescription}
      />
    );
  }

  return (
    <SurfaceCard
      title={SEM_RECEITA_PAGE.list.title}
      description={SEM_RECEITA_PAGE.list.description}
      tone="strong"
    >
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Utente</th>
              <th>Medicamento</th>
              <th>Quantidade</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const isDeleting = deletingItemId === item.id;

              return (
                <tr key={item.id}>
                  <td>
                    <strong>
                      {selectedUtente?.nome || "Utente selecionado"}
                    </strong>
                    <span>{selectedUtente?.numero9 || selectedUtenteId}</span>
                  </td>

                  <td>
                    <strong>{item.medicamento}</strong>
                    <span>{item.id}</span>
                  </td>

                  <td>
                    <strong>{item.quantidadeRestante}</strong>
                    <span>
                      Total {item.quantidade} · Reservada{" "}
                      {item.quantidadeReservadaPendente}
                    </span>
                  </td>

                  <td>{formatDateTime(item.createdAt)}</td>

                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={isDeleting}
                      disabled={Boolean(deletingItemId)}
                      onClick={() => onDelete?.(item)}
                    >
                      {isDeleting
                        ? SEM_RECEITA_PAGE.list.deletingLabel
                        : SEM_RECEITA_PAGE.list.deleteLabel}
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
