import Button from "../../shared/ui/Button/Button";
import ConfirmDialog from "../../shared/ui/ConfirmDialog/ConfirmDialog";
import FeedbackDialog from "../../shared/ui/FeedbackDialog/FeedbackDialog";
import PageHeader from "../../shared/ui/PageHeader/PageHeader";

import SantaCasaSectionNav from "../../features/santacasa/shared/components/SantaCasaSectionNav/SantaCasaSectionNav";

import UtenteCreateForm from "../../features/santacasa/utentes/components/UtenteCreateForm/UtenteCreateForm";
import UtentesList from "../../features/santacasa/utentes/components/UtentesList/UtentesList";
import { UTENTES_PAGE } from "../../features/santacasa/utentes/config/utentesPage.config";
import { useSantaCasaUtentes } from "../../features/santacasa/utentes/hooks/useSantaCasaUtentes";

import styles from "./SantaCasaUtentesPage.module.css";

export default function SantaCasaUtentesPage() {
  const {
    utentes,

    isLoading,
    isRefreshing,
    isCreating,

    deletingUtenteId,
    utenteToDelete,

    error,
    feedback,
    setFeedback,

    handleRefreshUtentes,
    handleCreateUtente,

    handleRequestDeleteUtente,
    handleCancelDeleteUtente,
    handleConfirmDeleteUtente,
  } = useSantaCasaUtentes();

  return (
    <section className={styles.page} aria-labelledby="utentes-title">
      <PageHeader
        titleId="utentes-title"
        eyebrow={UTENTES_PAGE.header.eyebrow}
        title={UTENTES_PAGE.header.title}
        description={UTENTES_PAGE.header.description}
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={handleRefreshUtentes}
            isLoading={isRefreshing}
            disabled={isRefreshing || isLoading}
          >
            {isRefreshing ? "A atualizar..." : "Atualizar lista"}
          </Button>
        }
      />

      <SantaCasaSectionNav />

      <div className={styles.content}>
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
      </div>

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

      <FeedbackDialog
        isOpen={Boolean(feedback)}
        type={feedback?.type}
        message={feedback?.message}
        onClose={() => setFeedback(null)}
      />
    </section>
  );
}
