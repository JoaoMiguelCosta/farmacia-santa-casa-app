import styles from "./BrandMark.module.css";

export default function BrandMark() {
  return (
    <div className={styles.brand} aria-label="Farmácia Santa Casa">
      <span className={styles.symbol} aria-hidden="true">
        +
      </span>

      <span className={styles.text}>
        <strong>Farmácia</strong>
        <small>Santa Casa</small>
      </span>
    </div>
  );
}
