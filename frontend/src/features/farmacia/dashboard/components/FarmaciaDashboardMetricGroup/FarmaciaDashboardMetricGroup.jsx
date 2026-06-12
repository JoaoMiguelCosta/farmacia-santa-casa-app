import { useId } from "react";

import FarmaciaDashboardMetricCard from "../FarmaciaDashboardMetricCard/FarmaciaDashboardMetricCard";

import styles from "./FarmaciaDashboardMetricGroup.module.css";

export default function FarmaciaDashboardMetricGroup({
  title,
  description,
  tone = "green",
  metrics = [],
}) {
  const titleId = useId();

  if (!Array.isArray(metrics) || metrics.length === 0) {
    return null;
  }

  const className = [styles.group, styles[tone]].filter(Boolean).join(" ");

  return (
    <section className={className} aria-labelledby={titleId}>
      <header className={styles.header}>
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>

        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </header>

      <ul className={styles.list}>
        {metrics.map((metric) => (
          <li key={metric.key}>
            <FarmaciaDashboardMetricCard metric={metric} />
          </li>
        ))}
      </ul>
    </section>
  );
}
