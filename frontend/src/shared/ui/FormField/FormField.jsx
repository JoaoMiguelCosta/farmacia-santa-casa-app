import { Children, cloneElement, isValidElement } from "react";

import { mergeAriaIds } from "../../utils/aria";

import { FORM_FIELD_CONFIG } from "./FormField.config";

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
  const describedBy = mergeAriaIds(hintId, errorId);

  const fieldClassName = error
    ? `${styles.field} ${styles.hasError}`
    : styles.field;

  const enhancedChildren =
    Children.count(children) === 1 && isValidElement(children)
      ? cloneElement(children, {
          id: children.props.id ?? id,
          required: children.props.required ?? required,
          "aria-invalid": error ? true : children.props["aria-invalid"],
          "aria-describedby": mergeAriaIds(
            children.props["aria-describedby"],
            describedBy,
          ),
        })
      : children;

  return (
    <div className={fieldClassName}>
      <label className={styles.label} htmlFor={id}>
        <span>{label}</span>

        {required ? (
          <strong aria-label={FORM_FIELD_CONFIG.requiredAriaLabel}>
            {FORM_FIELD_CONFIG.requiredSymbol}
          </strong>
        ) : null}
      </label>

      <div className={styles.control}>{enhancedChildren}</div>

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
