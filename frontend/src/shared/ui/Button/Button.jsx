import { classNames } from "../../utils/classNames";

import styles from "./Button.module.css";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const isDisabled = disabled || isLoading;
  const variantClassName = styles[variant] || styles.primary;
  const sizeClassName = styles[size] || styles.md;

  return (
    <button
      className={classNames(
        styles.button,
        variantClassName,
        sizeClassName,
        fullWidth && styles.fullWidth,
        className,
      )}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      data-loading={isLoading ? "true" : undefined}
      {...props}
    >
      {isLoading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : null}

      <span className={styles.label}>{children}</span>
    </button>
  );
}
