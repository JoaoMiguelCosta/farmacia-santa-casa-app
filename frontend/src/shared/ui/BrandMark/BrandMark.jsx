import { BRAND_MARK } from "./BrandMark.config";

import styles from "./BrandMark.module.css";

export default function BrandMark() {
  return (
    <div className={styles.brand} aria-label={BRAND_MARK.ariaLabel}>
      <span className={styles.symbol} aria-hidden="true">
        {BRAND_MARK.symbol}
      </span>

      <span className={styles.text}>
        <strong>{BRAND_MARK.title}</strong>
        <small>{BRAND_MARK.subtitle}</small>
      </span>
    </div>
  );
}
