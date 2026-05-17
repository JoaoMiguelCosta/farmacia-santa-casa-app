import styles from "./SystemManutencaoResult.module.css";

import { FARMACIA_MANUTENCAO_PAGE as SYSTEM_MANUTENCAO_PAGE } from "../../config/systemManutencaoPage.config";

import {
  buildMaintenanceResultSections,
  getJobLabel,
  getResultModeLabel,
} from "../../utils/systemManutencao.utils";

function SystemManutencaoResultState({ title, description }) {
  return (
    <div className={styles.state}>
      <strong className={styles.stateTitle}>{title}</strong>

      {description ? (
        <p className={styles.stateDescription}>{description}</p>
      ) : null}
    </div>
  );
}

function SystemManutencaoResultSection({ section }) {
  if (!section || !Array.isArray(section.rows) || section.rows.length === 0) {
    return null;
  }

  return (
    <section className={styles.resultSection} aria-label={section.title}>
      <h3 className={styles.resultSectionTitle}>{section.title}</h3>

      <dl className={styles.resultRows}>
        {section.rows.map((row) => (
          <div key={row.key} className={styles.resultRow}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function SystemManutencaoResult({ result = null }) {
  if (!result) {
    return (
      <section
        className={styles.section}
        aria-labelledby="system-manutencao-result-title"
      >
        <header className={styles.header}>
          <div className={styles.heading}>
            <h2 id="system-manutencao-result-title" className={styles.title}>
              {SYSTEM_MANUTENCAO_PAGE.sections.result.title}
            </h2>

            <p className={styles.description}>
              {SYSTEM_MANUTENCAO_PAGE.sections.result.description}
            </p>
          </div>
        </header>

        <SystemManutencaoResultState
          title={SYSTEM_MANUTENCAO_PAGE.sections.result.emptyTitle}
          description={SYSTEM_MANUTENCAO_PAGE.sections.result.emptyDescription}
        />
      </section>
    );
  }

  const sections = buildMaintenanceResultSections(result);

  return (
    <section
      className={styles.section}
      aria-labelledby="system-manutencao-result-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 id="system-manutencao-result-title" className={styles.title}>
            {SYSTEM_MANUTENCAO_PAGE.sections.result.title}
          </h2>

          <p className={styles.description}>
            {SYSTEM_MANUTENCAO_PAGE.sections.result.description}
          </p>
        </div>

        <div className={styles.badges}>
          <span className={styles.badge}>{getJobLabel(result.job)}</span>
          <span className={styles.badgeStrong}>
            {getResultModeLabel(result.mode)}
          </span>
        </div>
      </header>

      <div className={styles.resultGrid}>
        {sections.map((section) => (
          <SystemManutencaoResultSection key={section.key} section={section} />
        ))}
      </div>
    </section>
  );
}
