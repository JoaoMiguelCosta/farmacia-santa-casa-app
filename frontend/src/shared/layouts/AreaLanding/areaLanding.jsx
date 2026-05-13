import styles from "./AreaLanding.module.css";

export default function AreaLanding({
  eyebrow,
  title,
  description,
  tone = "green",
  actions = [],
}) {
  return (
    <section className={styles.page} aria-labelledby="area-title">
      <div className={`${styles.header} ${styles[tone]}`}>
        <p className={styles.kicker}>{eyebrow}</p>

        <h1 id="area-title" className={styles.title}>
          {title}
        </h1>

        <p className={styles.lead}>{description}</p>
      </div>

      <div className={styles.panel} aria-label={`Módulos — ${eyebrow}`}>
        {actions.map((action) => (
          <article key={action.title} className={styles.item}>
            <span className={styles.dot} aria-hidden="true" />

            <div className={styles.itemContent}>
              <h2>{action.title}</h2>
              <p>{action.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
