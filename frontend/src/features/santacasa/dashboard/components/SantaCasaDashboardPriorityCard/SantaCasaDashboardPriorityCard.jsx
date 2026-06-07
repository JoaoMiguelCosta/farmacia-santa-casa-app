import { Link } from "react-router-dom";

import styles from "./SantaCasaDashboardPriorityCard.module.css";

export default function SantaCasaDashboardPriorityCard({
  label,
  value,
  statusText,
  tone = "neutral",
  to,
  actionLabel,
}) {
  const className = [styles.card, styles[tone]].filter(Boolean).join(" ");

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
