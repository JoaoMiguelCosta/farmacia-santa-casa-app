import { Link } from "react-router-dom";

import styles from "./FarmaciaHomeActionCard.module.css";

export default function FarmaciaHomeActionCard({
  eyebrow,
  title,
  description,
  actionLabel,
  to,
  metaItems = [],
  variant = "quick",
  tone = "green",
}) {
  const className = [styles.card, styles[variant], styles[tone]]
    .filter(Boolean)
    .join(" ");

  return (
    <Link className={className} to={to}>
      <div className={styles.content}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}

        <h2 className={styles.title}>{title}</h2>

        <p className={styles.description}>{description}</p>

        {metaItems.length > 0 ? (
          <ul className={styles.metaList} aria-label="Áreas incluídas">
            {metaItems.map((item) => (
              <li key={item} className={styles.metaItem}>
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <span className={styles.action}>
        {actionLabel}
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </span>
    </Link>
  );
}
