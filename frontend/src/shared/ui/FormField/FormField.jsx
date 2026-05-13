import styles from "./FormField.module.css";

export default function FormField({
  id,
  label,
  hint,
  error,
  required = false,
  children,
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        <span>{label}</span>
        {required ? <strong aria-label="obrigatório">*</strong> : null}
      </label>

      <div
        className={styles.control}
        aria-describedby={
          [hintId, errorId].filter(Boolean).join(" ") || undefined
        }
      >
        {children}
      </div>

      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
