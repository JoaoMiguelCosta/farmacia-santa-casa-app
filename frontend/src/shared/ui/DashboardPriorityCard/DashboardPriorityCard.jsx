import { Link } from "react-router-dom";

import { classNames } from "../../utils/classNames";

import styles from "./DashboardPriorityCard.module.css";

export default function DashboardPriorityCard({
  label,
  value,
  statusText,
  tone = "neutral",
  to,
  actionLabel,
}) {
  const className = classNames(styles.card, styles[tone]);

  const content = (
    <>
      <div className={styles.heading}>
        <span className={styles.label}>{label}</span>

        <strong className={styles.value}>{value}</strong>
      </div>

      <div className={styles.footer}>
        <span className={styles.status}>{statusText}</span>

        {actionLabel ? (
          <span className={styles.action}>
            {actionLabel}
            <span aria-hidden="true">→</span>
          </span>
        ) : null}
      </div>
    </>
  );

  if (to) {
    return (
      <Link
        className={className}
        to={to}
        aria-label={`${label}: ${value}. ${statusText}`}
      >
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}
