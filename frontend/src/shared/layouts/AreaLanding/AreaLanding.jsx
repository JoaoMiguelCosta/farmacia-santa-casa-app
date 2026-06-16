import { Link } from "react-router-dom";

import {
  getAreaLandingLabel,
  getAreaLandingModulesLabel,
} from "./AreaLanding.utils";

import { classNames } from "../../utils/classNames";

import styles from "./AreaLanding.module.css";

export default function AreaLanding({
  eyebrow,
  title,
  description,
  tone = "green",
  actions = [],
}) {
  const toneClassName = styles[tone] || styles.green;
  const areaLabel = getAreaLandingLabel({ eyebrow, title });
  const modulesLabel = getAreaLandingModulesLabel(areaLabel);

  return (
    <section className={styles.page} aria-labelledby="area-title">
      <div className={classNames(styles.header, toneClassName)}>
        {eyebrow ? <p className={styles.kicker}>{eyebrow}</p> : null}

        <h1 id="area-title" className={styles.title}>
          {title}
        </h1>

        {description ? <p className={styles.lead}>{description}</p> : null}
      </div>

      <div className={styles.panel} aria-label={modulesLabel}>
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
                className={classNames(styles.item, styles.interactive)}
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
