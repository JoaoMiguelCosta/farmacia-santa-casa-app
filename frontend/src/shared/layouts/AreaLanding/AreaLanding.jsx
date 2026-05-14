import { Link } from "react-router-dom";

import styles from "./AreaLanding.module.css";

export default function AreaLanding({
  eyebrow,
  title,
  description,
  tone = "green",
  actions = [],
}) {
  const toneClassName = styles[tone] || styles.green;
  const areaLabel = eyebrow || title || "Área";

  return (
    <section className={styles.page} aria-labelledby="area-title">
      <div className={`${styles.header} ${toneClassName}`}>
        <p className={styles.kicker}>{eyebrow}</p>

        <h1 id="area-title" className={styles.title}>
          {title}
        </h1>

        <p className={styles.lead}>{description}</p>
      </div>

      <div className={styles.panel} aria-label={`Módulos — ${areaLabel}`}>
        {actions.map((action) => {
          const content = (
            <>
              <span className={styles.dot} aria-hidden="true" />

              <div className={styles.itemContent}>
                <h2>{action.title}</h2>
                <p>{action.description}</p>
              </div>
            </>
          );

          if (action.to) {
            return (
              <Link
                key={action.title}
                to={action.to}
                className={`${styles.item} ${styles.interactive}`}
              >
                {content}
              </Link>
            );
          }

          return (
            <article key={action.title} className={styles.item}>
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}
