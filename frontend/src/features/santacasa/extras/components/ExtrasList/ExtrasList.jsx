import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";
import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { EXTRAS_PAGE } from "../../config/extrasPage.config";

import styles from "./ExtrasList.module.css";

function getQuantidadeSolicitada(item) {
  return Number(item.quantidadeSolicitada ?? item.quantidade ?? 0) || 0;
}

function getQuantidadeRegularizada(item) {
  return (
    Number(item.quantidadeRegularizada ?? item.quantidadeDispensada ?? 0) || 0
  );
}

function getQuantidadeRestante(item) {
  const restante = Number(item.quantidadeRestante);

  if (Number.isFinite(restante)) return restante;

  return Math.max(
    0,
    getQuantidadeSolicitada(item) - getQuantidadeRegularizada(item),
  );
}

export default function ExtrasList({
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
        description="Depois de selecionares um utente, os Extras aparecem aqui."
      />
    );
  }

  if (isLoading) {
    return (
      <DataState
        type="loading"
        title={EXTRAS_PAGE.list.loadingTitle}
        description="Aguarda enquanto os Extras são carregados."
      />
    );
  }

  if (error) {
    return (
      <DataState
        type="error"
        title={EXTRAS_PAGE.list.errorTitle}
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
        title={EXTRAS_PAGE.list.emptyTitle}
        description={EXTRAS_PAGE.list.emptyDescription}
      />
    );
  }

  return (
    <SurfaceCard
      title={EXTRAS_PAGE.list.title}
      description={EXTRAS_PAGE.list.description}
      tone="strong"
    >
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Utente</th>
              <th>Medicamento</th>
              <th>Quantidade</th>
              <th>Estado</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const isDeleting = deletingItemId === item.id;
              const quantidadeSolicitada = getQuantidadeSolicitada(item);
              const quantidadeRegularizada = getQuantidadeRegularizada(item);
              const quantidadeRestante = getQuantidadeRestante(item);

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
                    <strong>{quantidadeRestante}</strong>
                    <span>
                      Total {quantidadeSolicitada} · Regularizada{" "}
                      {quantidadeRegularizada}
                    </span>
                  </td>

                  <td>
                    <span className={styles.status}>
                      {quantidadeRestante > 0 ? "Pendente" : "Regularizado"}
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
                        ? EXTRAS_PAGE.list.deletingLabel
                        : EXTRAS_PAGE.list.deleteLabel}
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
