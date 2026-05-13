import { useEffect, useState } from "react";

import Button from "../../shared/ui/Button/Button";
import ConfirmDialog from "../../shared/ui/ConfirmDialog/ConfirmDialog";
import PageHeader from "../../shared/ui/PageHeader/PageHeader";

import { UTENTES_PAGE } from "../../features/santacasa/utentes/config/utentesPage.config";
import {
  createUtente,
  deleteUtente,
  getUtentes,
} from "../../features/santacasa/utentes/api/utentesApi";
import UtenteCreateForm from "../../features/santacasa/utentes/components/UtenteCreateForm/UtenteCreateForm";
import UtentesList from "../../features/santacasa/utentes/components/UtentesList/UtentesList";
import { sortUtentesByName } from "../../shared/utils/sortUtentes.js";

import styles from "./SantaCasaUtentesPage.module.css";

export default function SantaCasaUtentesPage() {
  const [utentes, setUtentes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingUtenteId, setDeletingUtenteId] = useState(null);
  const [utenteToDelete, setUtenteToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  async function handleRefreshUtentes() {
    setIsRefreshing(true);
    setError(null);

    try {
      const data = await getUtentes();
      setUtentes(sortUtentesByName(data));
    } catch (requestError) {
      setError(requestError.message || "Erro ao carregar utentes.");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleCreateUtente(payload) {
    setIsCreating(true);
    setFeedback(null);

    try {
      const createdUtente = await createUtente(payload);

      setUtentes((currentUtentes) =>
        sortUtentesByName([createdUtente, ...currentUtentes]),
      );

      setFeedback({
        type: "success",
        message: UTENTES_PAGE.form.successMessage,
      });
    } catch (requestError) {
      setFeedback({
        type: "error",
        message: requestError.message || "Erro ao criar utente.",
      });
    } finally {
      setIsCreating(false);
    }
  }

  function handleRequestDeleteUtente(utente) {
    setUtenteToDelete(utente);
    setFeedback(null);
  }

  function handleCancelDeleteUtente() {
    if (deletingUtenteId) return;

    setUtenteToDelete(null);
  }

  async function handleConfirmDeleteUtente() {
    if (!utenteToDelete) return;

    setDeletingUtenteId(utenteToDelete.id);
    setFeedback(null);

    try {
      await deleteUtente(utenteToDelete.id);

      setUtentes((currentUtentes) =>
        currentUtentes.filter(
          (currentUtente) => currentUtente.id !== utenteToDelete.id,
        ),
      );

      setFeedback({
        type: "success",
        message: UTENTES_PAGE.list.deleteSuccessMessage,
      });

      setUtenteToDelete(null);
    } catch (requestError) {
      setFeedback({
        type: "error",
        message: requestError.message || "Erro ao remover utente.",
      });
    } finally {
      setDeletingUtenteId(null);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialUtentes() {
      try {
        const data = await getUtentes();

        if (!isMounted) return;

        setUtentes(sortUtentesByName(data));
        setError(null);
      } catch (requestError) {
        if (!isMounted) return;

        setError(requestError.message || "Erro ao carregar utentes.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialUtentes();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className={styles.page} aria-labelledby="utentes-title">
      <PageHeader
        eyebrow={UTENTES_PAGE.header.eyebrow}
        title={UTENTES_PAGE.header.title}
        description={UTENTES_PAGE.header.description}
        actions={
          <Button
            variant="secondary"
            onClick={handleRefreshUtentes}
            isLoading={isRefreshing}
          >
            {isRefreshing ? "A atualizar..." : "Atualizar lista"}
          </Button>
        }
      />

      {feedback ? (
        <div
          className={`${styles.feedback} ${styles[feedback.type]}`}
          role="status"
        >
          {feedback.message}
        </div>
      ) : null}

      <UtenteCreateForm
        onCreate={handleCreateUtente}
        isSubmitting={isCreating}
      />

      <UtentesList
        utentes={utentes}
        isLoading={isLoading}
        error={error}
        deletingUtenteId={deletingUtenteId}
        onRetry={handleRefreshUtentes}
        onDelete={handleRequestDeleteUtente}
      />

      <ConfirmDialog
        isOpen={Boolean(utenteToDelete)}
        title={UTENTES_PAGE.deleteDialog.title}
        description={
          utenteToDelete
            ? `${UTENTES_PAGE.deleteDialog.description} Utente: ${utenteToDelete.nome}.`
            : UTENTES_PAGE.deleteDialog.description
        }
        confirmLabel={UTENTES_PAGE.deleteDialog.confirmLabel}
        cancelLabel={UTENTES_PAGE.deleteDialog.cancelLabel}
        isLoading={Boolean(deletingUtenteId)}
        onConfirm={handleConfirmDeleteUtente}
        onCancel={handleCancelDeleteUtente}
      />
    </section>
  );
}
