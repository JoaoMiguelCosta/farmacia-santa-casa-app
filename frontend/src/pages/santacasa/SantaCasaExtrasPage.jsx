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
  createExtra,
  deleteExtra,
  getExtrasByUtente,
} from "../../features/santacasa/extras/api/extrasApi";
import ExtraCreateForm from "../../features/santacasa/extras/components/ExtraCreateForm/ExtraCreateForm";
import ExtrasList from "../../features/santacasa/extras/components/ExtrasList/ExtrasList";
import { EXTRAS_PAGE } from "../../features/santacasa/extras/config/extrasPage.config";
import { sortExtrasByMedicamento } from "../../features/santacasa/extras/utils/sortExtras";

import styles from "./SantaCasaExtrasPage.module.css";

export default function SantaCasaExtrasPage() {
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
      const data = await getExtrasByUtente(utenteId);
      setItems(sortExtrasByMedicamento(data));
    } catch (requestError) {
      setItemsError(requestError.message || "Erro ao carregar Extras.");
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
      const createdItem = await createExtra(selectedUtenteId, payload);

      setItems((currentItems) =>
        sortExtrasByMedicamento([createdItem, ...currentItems]),
      );

      setFeedback({
        type: "success",
        message: EXTRAS_PAGE.form.successMessage,
      });

      return {
        ok: true,
        fieldErrors: {},
      };
    } catch (requestError) {
      setFeedback({
        type: "error",
        message: requestError.message || "Erro ao criar Extra.",
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
      await deleteExtra(selectedUtenteId, itemToDelete.id);

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== itemToDelete.id),
      );

      setFeedback({
        type: "success",
        message: EXTRAS_PAGE.list.deleteSuccessMessage,
      });

      setItemToDelete(null);
    } catch (requestError) {
      setFeedback({
        type: "error",
        message: requestError.message || "Erro ao remover Extra.",
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

          const extrasData = await getExtrasByUtente(firstUtenteId);

          if (!isMounted) return;

          setItems(sortExtrasByMedicamento(extrasData));
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
    <section className={styles.page} aria-labelledby="extras-title">
      <PageHeader
        eyebrow={EXTRAS_PAGE.header.eyebrow}
        title={EXTRAS_PAGE.header.title}
        description={EXTRAS_PAGE.header.description}
        actions={
          <Button
            variant="secondary"
            onClick={handleRefreshItems}
            isLoading={isRefreshing}
            disabled={!selectedUtenteId}
          >
            {isRefreshing ? "A atualizar..." : "Atualizar Extras"}
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

      <ExtraCreateForm
        selectedUtenteId={selectedUtenteId}
        onCreate={handleCreateItem}
        isSubmitting={isCreating}
      />

      <ExtrasList
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
        title={EXTRAS_PAGE.deleteDialog.title}
        description={
          itemToDelete
            ? `${EXTRAS_PAGE.deleteDialog.description} Medicamento: ${itemToDelete.medicamento}.`
            : EXTRAS_PAGE.deleteDialog.description
        }
        confirmLabel={EXTRAS_PAGE.deleteDialog.confirmLabel}
        cancelLabel={EXTRAS_PAGE.deleteDialog.cancelLabel}
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
