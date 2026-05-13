import { useEffect, useMemo, useState } from "react";

import Button from "../../shared/ui/Button/Button";
import ConfirmDialog from "../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../shared/ui/FeedbackDialog/FeedbackDialog";
import PageHeader from "../../shared/ui/PageHeader/PageHeader";

import SantaCasaSectionNav from "../../features/santacasa/shared/components/SantaCasaSectionNav/SantaCasaSectionNav";
import UtenteSelector from "../../features/santacasa/shared/components/UtenteSelector/UtenteSelector";

import { getUtentes } from "../../features/santacasa/utentes/api/utentesApi";
import { sortUtentesByName } from "../../features/santacasa/utentes/utils/sortUtentes";

import {
  createSemReceita,
  deleteSemReceita,
  getSemReceitaByUtente,
} from "../../features/santacasa/sem-receita/api/semReceitaApi";
import SemReceitaCreateForm from "../../features/santacasa/sem-receita/components/SemReceitaCreateForm/SemReceitaCreateForm";
import SemReceitaList from "../../features/santacasa/sem-receita/components/SemReceitaList/SemReceitaList";
import { SEM_RECEITA_PAGE } from "../../features/santacasa/sem-receita/config/semReceitaPage.config";
import { sortSemReceitaByMedicamento } from "../../features/santacasa/sem-receita/utils/sortSemReceita";

import styles from "./SantaCasaSemReceitaPage.module.css";

function upsertSemReceitaItem(items, nextItem) {
  const exists = items.some((item) => item.id === nextItem.id);

  if (!exists) {
    return sortSemReceitaByMedicamento([nextItem, ...items]);
  }

  return sortSemReceitaByMedicamento(
    items.map((item) => (item.id === nextItem.id ? nextItem : item)),
  );
}

export default function SantaCasaSemReceitaPage() {
  const [utentes, setUtentes] = useState([]);
  const [selectedUtenteId, setSelectedUtenteId] = useState("");

  const [items, setItems] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isLoadingUtentes, setIsLoadingUtentes] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);

  const [utentesError, setUtentesError] = useState(null);
  const [itemsError, setItemsError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const selectedUtente = useMemo(
    () => utentes.find((utente) => utente.id === selectedUtenteId) ?? null,
    [utentes, selectedUtenteId],
  );

  async function loadItems(utenteId, { showRefreshing = false } = {}) {
    if (!utenteId) {
      setItems([]);
      return;
    }

    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoadingItems(true);
    }

    setItemsError(null);

    try {
      const data = await getSemReceitaByUtente(utenteId);
      setItems(sortSemReceitaByMedicamento(data));
    } catch (requestError) {
      setItemsError(
        requestError.message || "Erro ao carregar medicamentos sem receita.",
      );
    } finally {
      setIsLoadingItems(false);
      setIsRefreshing(false);
    }
  }

  function handleSelectUtente(utenteId) {
    setSelectedUtenteId(utenteId);
    setFeedback(null);
    loadItems(utenteId);
  }

  async function handleRefreshItems() {
    await loadItems(selectedUtenteId, { showRefreshing: true });
  }

  async function handleCreateItem(payload) {
    if (!selectedUtenteId) {
      return {
        ok: false,
        fieldErrors: {},
      };
    }

    setIsCreating(true);
    setFeedback(null);

    try {
      const savedItem = await createSemReceita(selectedUtenteId, payload);

      setItems((currentItems) => upsertSemReceitaItem(currentItems, savedItem));

      setFeedback({
        type: "success",
        message: SEM_RECEITA_PAGE.form.successMessage,
      });

      return {
        ok: true,
        fieldErrors: {},
      };
    } catch (requestError) {
      const message = requestError.message || "Erro ao criar medicamento.";

      setFeedback({
        type: "error",
        message,
      });

      return {
        ok: false,
        fieldErrors: {},
      };
    } finally {
      setIsCreating(false);
    }
  }

  function handleRequestDeleteItem(item) {
    setItemToDelete(item);
    setFeedback(null);
  }

  function handleCancelDeleteItem() {
    if (deletingItemId) return;

    setItemToDelete(null);
  }

  async function handleConfirmDeleteItem() {
    if (!selectedUtenteId || !itemToDelete) return;

    setDeletingItemId(itemToDelete.id);
    setFeedback(null);

    try {
      await deleteSemReceita(selectedUtenteId, itemToDelete.id);

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== itemToDelete.id),
      );

      setFeedback({
        type: "success",
        message: SEM_RECEITA_PAGE.list.deleteSuccessMessage,
      });

      setItemToDelete(null);
    } catch (requestError) {
      setFeedback({
        type: "error",
        message: requestError.message || "Erro ao remover medicamento.",
      });
    } finally {
      setDeletingItemId(null);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialUtentes() {
      try {
        const data = await getUtentes();

        if (!isMounted) return;

        const sortedUtentes = sortUtentesByName(data);

        setUtentes(sortedUtentes);
        setUtentesError(null);

        if (sortedUtentes.length > 0) {
          const firstUtenteId = sortedUtentes[0].id;
          setSelectedUtenteId(firstUtenteId);

          const semReceitaData = await getSemReceitaByUtente(firstUtenteId);

          if (!isMounted) return;

          setItems(sortSemReceitaByMedicamento(semReceitaData));
        }
      } catch (requestError) {
        if (!isMounted) return;

        setUtentesError(requestError.message || "Erro ao carregar utentes.");
      } finally {
        if (isMounted) {
          setIsLoadingUtentes(false);
          setIsLoadingItems(false);
        }
      }
    }

    loadInitialUtentes();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className={styles.page} aria-labelledby="sem-receita-title">
      <PageHeader
        eyebrow={SEM_RECEITA_PAGE.header.eyebrow}
        title={SEM_RECEITA_PAGE.header.title}
        description={SEM_RECEITA_PAGE.header.description}
        actions={
          <Button
            variant="secondary"
            onClick={handleRefreshItems}
            isLoading={isRefreshing}
            disabled={!selectedUtenteId}
          >
            {isRefreshing ? "A atualizar..." : "Atualizar lista"}
          </Button>
        }
      />

      <SantaCasaSectionNav />

      <UtenteSelector
        utentes={utentes}
        value={selectedUtenteId}
        onChange={handleSelectUtente}
        isLoading={isLoadingUtentes}
        error={utentesError}
      />

      <SemReceitaCreateForm
        selectedUtenteId={selectedUtenteId}
        onCreate={handleCreateItem}
        isSubmitting={isCreating}
      />

      <SemReceitaList
        items={items}
        selectedUtenteId={selectedUtenteId}
        selectedUtente={selectedUtente}
        isLoading={isLoadingItems}
        error={itemsError}
        deletingItemId={deletingItemId}
        onRetry={handleRefreshItems}
        onDelete={handleRequestDeleteItem}
      />

      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title={SEM_RECEITA_PAGE.deleteDialog.title}
        description={
          itemToDelete
            ? `${SEM_RECEITA_PAGE.deleteDialog.description} Medicamento: ${itemToDelete.medicamento}.`
            : SEM_RECEITA_PAGE.deleteDialog.description
        }
        confirmLabel={SEM_RECEITA_PAGE.deleteDialog.confirmLabel}
        cancelLabel={SEM_RECEITA_PAGE.deleteDialog.cancelLabel}
        isLoading={Boolean(deletingItemId)}
        onConfirm={handleConfirmDeleteItem}
        onCancel={handleCancelDeleteItem}
      />

      <FeedbackDialog
        isOpen={Boolean(feedback)}
        type={feedback?.type}
        message={feedback?.message}
        onClose={() => setFeedback(null)}
      />
    </section>
  );
}
