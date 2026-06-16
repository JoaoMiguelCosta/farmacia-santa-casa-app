import { Link } from "react-router-dom";

import { classNames } from "../../utils/classNames";

import styles from "./DashboardMetricCard.module.css";

export default function DashboardMetricCard({ metric }) {
  const hasLink = Boolean(metric.to);

  const className = classNames(styles.card, styles[metric.tone || "neutral"]);

  const content = (
    <>
      <span className={styles.label}>{metric.label}</span>

      <span className={styles.result}>
        <strong className={styles.value}>{metric.value}</strong>

        <span
          className={classNames(styles.arrow, !hasLink && styles.hiddenArrow)}
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
