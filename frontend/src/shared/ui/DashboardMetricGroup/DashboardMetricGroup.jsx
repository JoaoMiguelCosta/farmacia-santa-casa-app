import { useId } from "react";

import DashboardMetricCard from "../DashboardMetricCard/DashboardMetricCard";

import { classNames } from "../../utils/classNames";

import styles from "./DashboardMetricGroup.module.css";

export default function DashboardMetricGroup({
  title,
  description,
  tone = "green",
  metrics = [],
}) {
  const titleId = useId();

  if (!Array.isArray(metrics) || metrics.length === 0) {
    return null;
  }

  const className = classNames(styles.group, styles[tone]);

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
            <DashboardMetricCard metric={metric} />
          </li>
        ))}
      </ul>
    </section>
  );
}
