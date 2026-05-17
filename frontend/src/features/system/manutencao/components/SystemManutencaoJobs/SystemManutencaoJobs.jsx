import styles from "./SystemManutencaoJobs.module.css";

import { SYSTEM_MANUTENCAO_PAGE } from "../../config/systemManutencaoPage.config";

import {
  getJobRiskLabel,
  getJobWarning,
  hasJobOptions,
  supportsAnonymizeOption,
} from "../../utils/systemManutencao.utils";

function SystemManutencaoJobsState({
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className={styles.state}>
      <strong className={styles.stateTitle}>{title}</strong>

      {description ? (
        <p className={styles.stateDescription}>{description}</p>
      ) : null}

      {actionLabel && onAction ? (
        <button type="button" className={styles.stateAction} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function SystemManutencaoJobOptions({
  jobKey,
  values = {},
  isDisabled = false,
  onOptionChange,
}) {
  if (!hasJobOptions(jobKey)) return null;

  return (
    <div className={styles.options}>
      <label className={styles.optionField}>
        <span>{SYSTEM_MANUTENCAO_PAGE.options.offsetMonths.label}</span>

        <input
          type="number"
          min="0"
          step="1"
          value={values.offsetMonths ?? ""}
          placeholder={SYSTEM_MANUTENCAO_PAGE.options.offsetMonths.placeholder}
          disabled={isDisabled}
          onChange={(event) =>
            onOptionChange?.(jobKey, "offsetMonths", event.target.value)
          }
        />

        <small>{SYSTEM_MANUTENCAO_PAGE.options.offsetMonths.hint}</small>
      </label>

      {supportsAnonymizeOption(jobKey) ? (
        <label className={styles.checkboxField}>
          <input
            type="checkbox"
            checked={Boolean(values.anonymize)}
            disabled={isDisabled}
            onChange={(event) =>
              onOptionChange?.(jobKey, "anonymize", event.target.checked)
            }
          />

          <span>
            <strong>{SYSTEM_MANUTENCAO_PAGE.options.anonymize.label}</strong>
            <small>{SYSTEM_MANUTENCAO_PAGE.options.anonymize.hint}</small>
          </span>
        </label>
      ) : null}
    </div>
  );
}

function SystemManutencaoJobCard({
  job,
  values,
  isBusy = false,
  isPreviewing = false,
  isRunning = false,
  canRun = false,
  onPreview,
  onRun,
  onOptionChange,
}) {
  const warning = getJobWarning(job.key);
  const risk = getJobRiskLabel(job.key);

  const isDisabled = isBusy;
  const isCurrentJobBusy = isPreviewing || isRunning;

  return (
    <article className={styles.job}>
      <header className={styles.jobHeader}>
        <div className={styles.jobIdentity}>
          <span className={styles.jobEyebrow}>{job.scheduleLabel}</span>

          <h3 className={styles.jobTitle}>{job.title}</h3>

          <p className={styles.jobDescription}>{job.description}</p>
        </div>

        <span className={styles.risk}>Risco: {risk}</span>
      </header>

      {warning ? (
        <p className={styles.warning}>
          <strong>Atenção:</strong> {warning}
        </p>
      ) : null}

      <SystemManutencaoJobOptions
        jobKey={job.key}
        values={values}
        isDisabled={isDisabled}
        onOptionChange={onOptionChange}
      />

      <footer className={styles.jobActions}>
        <button
          type="button"
          className={styles.previewButton}
          disabled={isDisabled}
          onClick={() => onPreview?.(job.key)}
        >
          {isPreviewing
            ? SYSTEM_MANUTENCAO_PAGE.actions.previewing
            : SYSTEM_MANUTENCAO_PAGE.actions.preview}
        </button>

        <button
          type="button"
          className={styles.runButton}
          disabled={isDisabled || !canRun || isCurrentJobBusy}
          onClick={() => onRun?.(job.key)}
        >
          {isRunning
            ? SYSTEM_MANUTENCAO_PAGE.actions.running
            : SYSTEM_MANUTENCAO_PAGE.actions.run}
        </button>
      </footer>

      {!canRun ? (
        <p className={styles.runHint}>
          Faz uma pré-visualização deste job antes de executar.
        </p>
      ) : null}
    </article>
  );
}

export default function SystemManutencaoJobs({
  jobs = [],
  jobOptions = {},
  isLoading = false,
  isRefreshing = false,
  isBusy = false,
  previewingJobKey = null,
  runningJobKey = null,
  canRunByJob = {},
  error = null,
  onRefresh,
  onPreview,
  onRun,
  onOptionChange,
}) {
  const hasJobs = jobs.length > 0;
  const sectionConfig = SYSTEM_MANUTENCAO_PAGE.sections.jobs;

  if (isLoading) {
    return (
      <section className={styles.section} aria-live="polite">
        <SystemManutencaoJobsState
          title={sectionConfig.loadingTitle}
          description="Aguarda enquanto os jobs são carregados."
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section} aria-live="polite">
        <SystemManutencaoJobsState
          title={sectionConfig.errorTitle}
          description={error}
          actionLabel={SYSTEM_MANUTENCAO_PAGE.actions.refresh}
          onAction={onRefresh}
        />
      </section>
    );
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="system-manutencao-jobs-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 id="system-manutencao-jobs-title" className={styles.title}>
            {sectionConfig.title}
          </h2>

          <p className={styles.description}>{sectionConfig.description}</p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          disabled={isRefreshing || isBusy}
          onClick={onRefresh}
        >
          {isRefreshing
            ? SYSTEM_MANUTENCAO_PAGE.actions.refreshing
            : SYSTEM_MANUTENCAO_PAGE.actions.refresh}
        </button>
      </header>

      {!hasJobs ? (
        <SystemManutencaoJobsState
          title={sectionConfig.emptyTitle}
          description={sectionConfig.emptyDescription}
        />
      ) : (
        <div className={styles.list}>
          {jobs.map((job) => (
            <SystemManutencaoJobCard
              key={job.key}
              job={job}
              values={jobOptions[job.key]}
              isBusy={isBusy}
              isPreviewing={previewingJobKey === job.key}
              isRunning={runningJobKey === job.key}
              canRun={Boolean(canRunByJob[job.key])}
              onPreview={onPreview}
              onRun={onRun}
              onOptionChange={onOptionChange}
            />
          ))}
        </div>
      )}
    </section>
  );
}
