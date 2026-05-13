import { classNames } from "../../utils/classNames";

import styles from "./SurfaceCard.module.css";

export default function SurfaceCard({
  eyebrow,
  title,
  description,
  children,
  footer = null,
  tone = "default",
  className = "",
}) {
  return (
    <article className={classNames(styles.card, styles[tone], className)}>
      {(eyebrow || title || description) && (
        <header className={styles.header}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          {title ? <h2 className={styles.title}>{title}</h2> : null}
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </header>
      )}

      {children ? <div className={styles.body}>{children}</div> : null}

      {footer ? <footer className={styles.footer}>{footer}</footer> : null}
    </article>
  );
}
