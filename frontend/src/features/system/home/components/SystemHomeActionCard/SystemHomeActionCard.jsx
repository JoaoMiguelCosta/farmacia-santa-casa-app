// src/features/system/home/components/SystemHomeActionCard/SystemHomeActionCard.jsx

import { Link } from "react-router-dom";

import styles from "./SystemHomeActionCard.module.css";

function getCardClassName({ variant, tone }) {
  return [styles.card, styles[variant], styles[tone]].filter(Boolean).join(" ");
}

function CardContent({ eyebrow, title, description, actionLabel }) {
  return (
    <>
      <div className={styles.content}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}

        <h2 className={styles.title}>{title}</h2>

        <p className={styles.description}>{description}</p>
      </div>

      <span className={styles.action}>
        {actionLabel}
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </span>
    </>
  );
}

export default function SystemHomeActionCard({
  eyebrow,
  title,
  description,
  actionLabel,
  to,
  variant = "secondary",
  tone = "green",
}) {
  const className = getCardClassName({ variant, tone });

  if (to) {
    return (
      <Link className={className} to={to}>
        <CardContent
          eyebrow={eyebrow}
          title={title}
          description={description}
          actionLabel={actionLabel}
        />
      </Link>
    );
  }

  return (
    <article className={`${className} ${styles.staticCard}`}>
      <CardContent
        eyebrow={eyebrow}
        title={title}
        description={description}
        actionLabel={actionLabel}
      />
    </article>
  );
}
