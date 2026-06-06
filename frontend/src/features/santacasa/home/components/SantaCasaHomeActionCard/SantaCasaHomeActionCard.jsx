import { useId } from "react";
import { Link } from "react-router-dom";

import styles from "./SantaCasaHomeActionCard.module.css";

export default function SantaCasaHomeActionCard({
  eyebrow,
  title,
  description,
  actionLabel,
  to,
  metaItems = [],
  variant = "quick",
  tone = "green",
}) {
  const titleId = useId();
  const descriptionId = useId();

  const cardClassName = [styles.card, styles[variant], styles[tone]]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      className={cardClassName}
      to={to}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className={styles.content}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}

        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>

        <p id={descriptionId} className={styles.description}>
          {description}
        </p>

        {metaItems.length > 0 ? (
          <ul className={styles.metaList}>
            {metaItems.map((item) => (
              <li key={item} className={styles.metaItem}>
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <span className={styles.action}>
        <span>{actionLabel}</span>
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </span>
    </Link>
  );
}
