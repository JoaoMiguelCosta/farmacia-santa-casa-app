import styles from "./SystemHealthState.module.css";

export default function SystemHealthState({ title, description }) {
  return (
    <div className={styles.state}>
      <strong className={styles.stateTitle}>{title}</strong>

      {description ? (
        <p className={styles.stateDescription}>{description}</p>
      ) : null}
    </div>
  );
}
