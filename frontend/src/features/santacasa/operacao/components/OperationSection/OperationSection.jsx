// src/features/santacasa/operacao/components/OperationSection/OperationSection.jsx
import styles from "./OperationSection.module.css";

function joinClassNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function OperationSection({
  id,
  tone = "default",
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section
      id={id}
      className={joinClassNames(styles.section, styles[tone])}
      aria-labelledby={`${id}-title`}
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>{eyebrow}</p>

          <h2 id={`${id}-title`} className={styles.title}>
            {title}
          </h2>

          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </div>
      </header>

      <div className={styles.content}>{children}</div>
    </section>
  );
}
