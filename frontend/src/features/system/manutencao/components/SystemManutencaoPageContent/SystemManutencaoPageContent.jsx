// src/features/system/manutencao/components/SystemManutencaoPageContent/SystemManutencaoPageContent.jsx

import { useEffect, useRef, useState } from "react";

import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import SystemManutencaoJobs from "../SystemManutencaoJobs/SystemManutencaoJobs";
import SystemManutencaoResult from "../SystemManutencaoResult/SystemManutencaoResult";

import { SYSTEM_MANUTENCAO_PAGE } from "../../config/systemManutencaoPage.config";
import { useSystemManutencao } from "../../hooks/useSystemManutencao";
import { getJobLabel } from "../../utils/systemManutencao.utils";

import styles from "./SystemManutencaoPageContent.module.css";

export default function SystemManutencaoPageContent() {
  const [pendingRunJobKey, setPendingRunJobKey] = useState(null);

  const resultRef = useRef(null);
  const hasMountedRef = useRef(false);

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

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (!latestResult) return;

    resultRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [latestResult]);

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

      <div ref={resultRef}>
        <SystemManutencaoResult result={latestResult} />
      </div>

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
