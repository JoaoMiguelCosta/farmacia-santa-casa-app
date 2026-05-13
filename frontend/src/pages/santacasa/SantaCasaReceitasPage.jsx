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
  createReceita,
  deleteReceitaLinha,
  getReceitasByUtente,
} from "../../features/santacasa/receitas/api/receitasApi";
import ReceitaCreateForm from "../../features/santacasa/receitas/components/ReceitaCreateForm/ReceitaCreateForm";
import ReceitasList from "../../features/santacasa/receitas/components/ReceitasList/ReceitasList";
import { RECEITAS_PAGE } from "../../features/santacasa/receitas/config/receitasPage.config";
import { sortReceitasByMedicamento } from "../../features/santacasa/receitas/utils/sortReceitas";

import styles from "./SantaCasaReceitasPage.module.css";

function getReceitaFieldErrors(requestError) {
  if (requestError?.status === 409) {
    return {
      numero19:
        requestError.message || "Já existe uma receita com esse número.",
    };
  }

  return {};
}

export default function SantaCasaReceitasPage() {
  const [utentes, setUtentes] = useState([]);
  const [selectedUtenteId, setSelectedUtenteId] = useState("");

  const [receitas, setReceitas] = useState([]);
  const [linhaToDelete, setLinhaToDelete] = useState(null);

  const [isLoadingUtentes, setIsLoadingUtentes] = useState(true);
  const [isLoadingReceitas, setIsLoadingReceitas] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingLinhaId, setDeletingLinhaId] = useState(null);

  const [utentesError, setUtentesError] = useState(null);
  const [receitasError, setReceitasError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const selectedUtente = useMemo(
    () => utentes.find((utente) => utente.id === selectedUtenteId) ?? null,
    [utentes, selectedUtenteId],
  );

  async function loadReceitas(utenteId, { showRefreshing = false } = {}) {
    if (!utenteId) {
      setReceitas([]);
      return;
    }

    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoadingReceitas(true);
    }

    setReceitasError(null);

    try {
      const data = await getReceitasByUtente(utenteId);
      setReceitas(sortReceitasByMedicamento(data));
    } catch (requestError) {
      setReceitasError(requestError.message || "Erro ao carregar receitas.");
    } finally {
      setIsLoadingReceitas(false);
      setIsRefreshing(false);
    }
  }

  function handleSelectUtente(utenteId) {
    setSelectedUtenteId(utenteId);
    setFeedback(null);
    loadReceitas(utenteId);
  }

  async function handleRefreshReceitas() {
    await loadReceitas(selectedUtenteId, { showRefreshing: true });
  }

  async function handleCreateReceita(payload) {
    if (!selectedUtenteId) {
      return {
        ok: false,
        fieldErrors: {},
      };
    }

    setIsCreating(true);
    setFeedback(null);

    try {
      await createReceita(selectedUtenteId, payload);
      await loadReceitas(selectedUtenteId, { showRefreshing: true });

      setFeedback({
        type: "success",
        message: RECEITAS_PAGE.form.successMessage,
      });

      return {
        ok: true,
        fieldErrors: {},
      };
    } catch (requestError) {
      const message = requestError.message || "Erro ao criar receita.";
      const fieldErrors = getReceitaFieldErrors(requestError);

      setFeedback({
        type: "error",
        message,
      });

      return {
        ok: false,
        fieldErrors,
      };
    } finally {
      setIsCreating(false);
    }
  }

  function handleRequestDeleteLinha(linha) {
    setLinhaToDelete(linha);
    setFeedback(null);
  }

  function handleCancelDeleteLinha() {
    if (deletingLinhaId) return;

    setLinhaToDelete(null);
  }

  async function handleConfirmDeleteLinha() {
    if (!selectedUtenteId || !linhaToDelete) return;

    setDeletingLinhaId(linhaToDelete.linhaId);
    setFeedback(null);

    try {
      await deleteReceitaLinha(selectedUtenteId, linhaToDelete.linhaId);

      setReceitas((currentReceitas) =>
        currentReceitas.filter(
          (linha) => linha.linhaId !== linhaToDelete.linhaId,
        ),
      );

      setFeedback({
        type: "success",
        message: RECEITAS_PAGE.list.deleteSuccessMessage,
      });

      setLinhaToDelete(null);
    } catch (requestError) {
      setFeedback({
        type: "error",
        message: requestError.message || "Erro ao remover linha de receita.",
      });
    } finally {
      setDeletingLinhaId(null);
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
          loadReceitas(firstUtenteId);
        }
      } catch (requestError) {
        if (!isMounted) return;

        setUtentesError(requestError.message || "Erro ao carregar utentes.");
      } finally {
        if (isMounted) {
          setIsLoadingUtentes(false);
        }
      }
    }

    loadInitialUtentes();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className={styles.page} aria-labelledby="receitas-title">
      <PageHeader
        eyebrow={RECEITAS_PAGE.header.eyebrow}
        title={RECEITAS_PAGE.header.title}
        description={RECEITAS_PAGE.header.description}
        actions={
          <Button
            variant="secondary"
            onClick={handleRefreshReceitas}
            isLoading={isRefreshing}
            disabled={!selectedUtenteId}
          >
            {isRefreshing ? "A atualizar..." : "Atualizar receitas"}
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

      <ReceitaCreateForm
        selectedUtenteId={selectedUtenteId}
        onCreate={handleCreateReceita}
        isSubmitting={isCreating}
      />

      <ReceitasList
        receitas={receitas}
        selectedUtenteId={selectedUtenteId}
        selectedUtente={selectedUtente}
        isLoading={isLoadingReceitas}
        error={receitasError}
        deletingLinhaId={deletingLinhaId}
        onRetry={handleRefreshReceitas}
        onDelete={handleRequestDeleteLinha}
      />

      <ConfirmDialog
        isOpen={Boolean(linhaToDelete)}
        title={RECEITAS_PAGE.deleteDialog.title}
        description={
          linhaToDelete
            ? `${RECEITAS_PAGE.deleteDialog.description} Medicamento: ${linhaToDelete.medicamento}.`
            : RECEITAS_PAGE.deleteDialog.description
        }
        confirmLabel={RECEITAS_PAGE.deleteDialog.confirmLabel}
        cancelLabel={RECEITAS_PAGE.deleteDialog.cancelLabel}
        isLoading={Boolean(deletingLinhaId)}
        onConfirm={handleConfirmDeleteLinha}
        onCancel={handleCancelDeleteLinha}
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
