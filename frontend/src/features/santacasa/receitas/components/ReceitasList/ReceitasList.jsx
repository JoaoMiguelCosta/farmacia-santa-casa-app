import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";
import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { RECEITAS_PAGE } from "../../config/receitasPage.config";

import styles from "./ReceitasList.module.css";

function formatDateOnly(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
  }).format(date);
}

function getRecipeKey(linha) {
  return [linha.receitaId, linha.numero19, linha.pinAcesso6, linha.pinOpcao4]
    .filter(Boolean)
    .join("-");
}

function groupReceitasByRecipe(receitas = []) {
  const groups = [];

  receitas.forEach((linha) => {
    const key = getRecipeKey(linha);
    const latestGroup = groups[groups.length - 1];

    if (latestGroup?.key === key) {
      latestGroup.linhas.push(linha);
      return;
    }

    groups.push({
      key,
      receita: linha,
      linhas: [linha],
    });
  });

  return groups;
}

export default function ReceitasList({
  receitas = [],
  selectedUtenteId = "",
  selectedUtente = null,
  isLoading = false,
  error = null,
  deletingLinhaId = null,
  onRetry,
  onDelete,
}) {
  if (!selectedUtenteId) {
    return (
      <DataState
        type="empty"
        title="Seleciona um utente."
        description="Depois de selecionares um utente, as receitas disponíveis aparecem aqui."
      />
    );
  }

  if (isLoading) {
    return (
      <DataState
        type="loading"
        title={RECEITAS_PAGE.list.loadingTitle}
        description="Aguarda enquanto as receitas são carregadas."
      />
    );
  }

  if (error) {
    return (
      <DataState
        type="error"
        title={RECEITAS_PAGE.list.errorTitle}
        description={error}
        actionLabel="Tentar novamente"
        onAction={onRetry}
      />
    );
  }

  if (receitas.length === 0) {
    return (
      <DataState
        type="empty"
        title={RECEITAS_PAGE.list.emptyTitle}
        description={RECEITAS_PAGE.list.emptyDescription}
      />
    );
  }

  const receitaGroups = groupReceitasByRecipe(receitas);

  return (
    <SurfaceCard
      title={RECEITAS_PAGE.list.title}
      description={RECEITAS_PAGE.list.description}
      tone="strong"
    >
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Utente</th>
              <th>Receita</th>
              <th>Medicamento</th>
              <th>Quantidade</th>
              <th>Validade</th>
              <th>Estado</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {receitaGroups.map((group) =>
              group.linhas.map((linha, index) => {
                const isDeleting = deletingLinhaId === linha.linhaId;
                const isFirstRecipeLine = index === 0;

                return (
                  <tr key={linha.linhaId}>
                    {isFirstRecipeLine ? (
                      <td
                        rowSpan={group.linhas.length}
                        className={styles.groupCell}
                      >
                        <strong>
                          {selectedUtente?.nome || "Utente selecionado"}
                        </strong>
                        <span>
                          {selectedUtente?.numero9 || selectedUtenteId}
                        </span>
                      </td>
                    ) : null}

                    {isFirstRecipeLine ? (
                      <td
                        rowSpan={group.linhas.length}
                        className={styles.groupCell}
                      >
                        <strong>{linha.numero19}</strong>
                        <span>
                          PIN {linha.pinAcesso6} · Opção {linha.pinOpcao4}
                        </span>
                      </td>
                    ) : null}

                    <td>
                      <strong>{linha.medicamento}</strong>
                      <span>{linha.linhaId}</span>
                    </td>

                    <td>
                      <strong>{linha.quantidadeRestante}</strong>
                      <span>
                        Total {linha.quantidade} · Dispensada{" "}
                        {linha.quantidadeDispensada}
                      </span>
                    </td>

                    <td>{formatDateOnly(linha.validade)}</td>

                    <td>
                      <span className={styles.status}>{linha.status}</span>
                    </td>

                    <td>{formatDateTime(linha.createdAt)}</td>

                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={isDeleting}
                        disabled={Boolean(deletingLinhaId)}
                        onClick={() => onDelete?.(linha)}
                      >
                        {isDeleting
                          ? RECEITAS_PAGE.list.deletingLabel
                          : RECEITAS_PAGE.list.deleteLabel}
                      </Button>
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}
