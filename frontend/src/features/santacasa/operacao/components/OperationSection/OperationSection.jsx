import styles from "./OperationSection.module.css";

export default function OperationSection({
  id,
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{eyebrow}</p>

        <h2 id={`${id}-title`} className={styles.title}>
          {title}
        </h2>

        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </header>

      <div className={styles.content}>{children}</div>
    </section>
  );
}
