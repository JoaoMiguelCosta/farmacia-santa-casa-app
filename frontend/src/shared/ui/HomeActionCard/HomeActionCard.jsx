import { useId } from "react";
import { Link } from "react-router-dom";

import { classNames } from "../../utils/classNames";

import styles from "./HomeActionCard.module.css";

export default function HomeActionCard({
  eyebrow,
  title,
  description,
  actionLabel,
  to,
  metaItems = [],
  metaAriaLabel = "",
  variant = "quick",
  tone = "green",
}) {
  const titleId = useId();
  const descriptionId = useId();

  const className = classNames(styles.card, styles[variant], styles[tone]);

  const content = (
    <>
      <div className={styles.content}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}

        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>

        <p id={descriptionId} className={styles.description}>
          {description}
        </p>

        {metaItems.length > 0 ? (
          <ul className={styles.metaList} aria-label={metaAriaLabel}>
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
    </>
  );

  if (to) {
    return (
      <Link
        className={className}
        to={to}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        {content}
      </Link>
    );
  }

  return (
    <article
      className={classNames(className, styles.staticCard)}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {content}
    </article>
  );
}
