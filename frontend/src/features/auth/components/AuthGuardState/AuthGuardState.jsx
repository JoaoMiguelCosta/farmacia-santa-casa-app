// src/features/auth/components/AuthGuardState/AuthGuardState.jsx

import { useId } from "react";

import styles from "./AuthGuardState.module.css";

export default function AuthGuardState({ title, description }) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <section className={styles.guard}>
      <div
        className={styles.card}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <span className={styles.indicator} aria-hidden="true" />

        <div className={styles.content}>
          <h1 id={titleId} className={styles.title}>
            {title}
          </h1>

          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
