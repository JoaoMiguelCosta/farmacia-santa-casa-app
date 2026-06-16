import { useEffect, useRef } from "react";

import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";
import ConfirmDialog from "../../../../../shared/ui/ConfirmDialog/ConfirmDialog";

import SystemManutencaoJobs from "../SystemManutencaoJobs/SystemManutencaoJobs";
import SystemManutencaoResult from "../SystemManutencaoResult/SystemManutencaoResult";

import { SYSTEM_MANUTENCAO_PAGE } from "../../config/systemManutencaoPage.config";
import { useSystemManutencao } from "../../hooks/useSystemManutencao";
import { useSystemManutencaoDialogs } from "../../hooks/useSystemManutencaoDialogs";
import { getJobLabel } from "../../utils/systemManutencao.utils";

import styles from "./SystemManutencaoPageContent.module.css";

export default function SystemManutencaoPageContent() {
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

  const {
    pendingRunJobKey,
    handleRequestRun,
    handleCancelRun,
    handleConfirmRun,
  } = useSystemManutencaoDialogs({ runJob });

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

      <ConfirmDialog
        isOpen={Boolean(pendingRunJobKey)}
        title={SYSTEM_MANUTENCAO_PAGE.confirmDialog.title}
        description={`${SYSTEM_MANUTENCAO_PAGE.confirmDialog.description} Job selecionado: ${pendingRunJobLabel}.`}
        confirmLabel={SYSTEM_MANUTENCAO_PAGE.confirmDialog.confirmLabel}
        cancelLabel={SYSTEM_MANUTENCAO_PAGE.confirmDialog.cancelLabel}
        isLoading={Boolean(runningJobKey)}
        onConfirm={handleConfirmRun}
        onCancel={handleCancelRun}
      />
    </section>
  );
}
