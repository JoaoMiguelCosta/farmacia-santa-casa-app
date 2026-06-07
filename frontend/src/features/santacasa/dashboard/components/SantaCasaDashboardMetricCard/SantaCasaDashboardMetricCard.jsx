import { Link } from "react-router-dom";

import styles from "./SantaCasaDashboardMetricCard.module.css";

export default function SantaCasaDashboardMetricCard({ metric }) {
  const hasLink = Boolean(metric.to);

  const className = [styles.card, styles[metric.tone || "neutral"]]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className={styles.label}>{metric.label}</span>

      <span className={styles.result}>
        <strong className={styles.value}>{metric.value}</strong>

        <span
          className={[styles.arrow, !hasLink ? styles.hiddenArrow : ""]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        >
          →
        </span>
      </span>
    </>
  );

  if (hasLink) {
    return (
      <Link
        className={className}
        to={metric.to}
        aria-label={`${metric.label}: ${metric.value}`}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
