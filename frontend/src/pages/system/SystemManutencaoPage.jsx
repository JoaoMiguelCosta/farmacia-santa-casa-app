import { useState } from "react";

import PageHeader from "../../shared/ui/PageHeader/PageHeader";

import SystemManutencaoJobs from "../../features/system/manutencao/components/SystemManutencaoJobs/SystemManutencaoJobs";
import SystemManutencaoResult from "../../features/system/manutencao/components/SystemManutencaoResult/SystemManutencaoResult";

import { SYSTEM_MANUTENCAO_PAGE } from "../../features/system/manutencao/config/systemManutencaoPage.config";
import { useSystemManutencao } from "../../features/system/manutencao/hooks/useSystemManutencao";
import { getJobLabel } from "../../features/system/manutencao/utils/systemManutencao.utils";

import styles from "./SystemManutencaoPage.module.css";

export default function SystemManutencaoPage() {
  const [pendingRunJobKey, setPendingRunJobKey] = useState(null);

  const {
    jobs,
    jobOptions,
    latestResult,

    isLoadingJobs,
    isRefreshingJobs,
    isBusy,

    previewingJobKey,
    runningJobKey,

    canRunByJob,

    error,

    refreshJobs,

    updateJobOption,
    previewJob,
    runJob,
  } = useSystemManutencao();

  const pendingRunJobLabel = getJobLabel(pendingRunJobKey);

  function handleRequestRun(jobKey) {
    setPendingRunJobKey(jobKey);
  }

  function handleCancelRun() {
    setPendingRunJobKey(null);
  }

  async function handleConfirmRun() {
    if (!pendingRunJobKey) return;

    await runJob(pendingRunJobKey);
    setPendingRunJobKey(null);
  }

  return (
    <section className={styles.page} aria-labelledby="system-manutencao-title">
      <PageHeader
        titleId="system-manutencao-title"
        eyebrow={SYSTEM_MANUTENCAO_PAGE.header.eyebrow}
        title={SYSTEM_MANUTENCAO_PAGE.header.title}
        description={SYSTEM_MANUTENCAO_PAGE.header.description}
      />

      <SystemManutencaoJobs
        jobs={jobs}
        jobOptions={jobOptions}
        isLoading={isLoadingJobs}
        isRefreshing={isRefreshingJobs}
        isBusy={isBusy}
        previewingJobKey={previewingJobKey}
        runningJobKey={runningJobKey}
        canRunByJob={canRunByJob}
        error={error}
        onRefresh={refreshJobs}
        onPreview={previewJob}
        onRun={handleRequestRun}
        onOptionChange={updateJobOption}
      />

      <SystemManutencaoResult result={latestResult} />

      {pendingRunJobKey ? (
        <div className={styles.dialogBackdrop} role="presentation">
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="system-manutencao-confirm-title"
            aria-describedby="system-manutencao-confirm-description"
          >
            <div className={styles.dialogContent}>
              <p className={styles.dialogEyebrow}>Confirmação necessária</p>

              <h2
                id="system-manutencao-confirm-title"
                className={styles.dialogTitle}
              >
                {SYSTEM_MANUTENCAO_PAGE.confirmDialog.title}
              </h2>

              <p
                id="system-manutencao-confirm-description"
                className={styles.dialogDescription}
              >
                {SYSTEM_MANUTENCAO_PAGE.confirmDialog.description}
              </p>

              <p className={styles.dialogJob}>
                Job selecionado: <strong>{pendingRunJobLabel}</strong>
              </p>
            </div>

            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.cancelButton}
                disabled={Boolean(runningJobKey)}
                onClick={handleCancelRun}
              >
                {SYSTEM_MANUTENCAO_PAGE.confirmDialog.cancelLabel}
              </button>

              <button
                type="button"
                className={styles.confirmButton}
                disabled={Boolean(runningJobKey)}
                onClick={handleConfirmRun}
              >
                {runningJobKey
                  ? SYSTEM_MANUTENCAO_PAGE.actions.running
                  : SYSTEM_MANUTENCAO_PAGE.confirmDialog.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
