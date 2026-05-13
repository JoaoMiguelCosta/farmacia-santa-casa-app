import styles from "./PageHeader.module.css";

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions = null,
  align = "left",
}) {
  return (
    <header className={`${styles.header} ${styles[align]}`}>
      <div className={styles.content}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}

        <h1 className={styles.title}>{title}</h1>

        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>

      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
