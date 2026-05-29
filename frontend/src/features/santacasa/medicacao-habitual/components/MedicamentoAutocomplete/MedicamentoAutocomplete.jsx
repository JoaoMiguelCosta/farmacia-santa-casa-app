import FormField from "../../../../../shared/ui/FormField/FormField";

import styles from "./MedicamentoAutocomplete.module.css";

function normalizeOptions(options = []) {
  return options
    .map((option) => {
      if (typeof option === "string") {
        return {
          id: option,
          value: option,
          label: option,
        };
      }

      return {
        id: option?.id || option?.value || option?.label,
        value: option?.value || option?.label || "",
        label: option?.label || option?.value || "",
      };
    })
    .filter((option) => option.value && option.label);
}

export default function MedicamentoAutocomplete({
  id,
  label,
  hint,
  error,
  value,
  placeholder,
  options = [],
  disabled = false,
  required = false,
  onChange,
}) {
  const normalizedOptions = normalizeOptions(options);
  const listId = `${id}-options`;

  return (
    <FormField
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
    >
      <div className={styles.field}>
        <input
          id={id}
          type="text"
          list={normalizedOptions.length > 0 ? listId : undefined}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          disabled={disabled}
          autoComplete="off"
        />

        {normalizedOptions.length > 0 ? (
          <datalist id={listId}>
            {normalizedOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </datalist>
        ) : null}
      </div>
    </FormField>
  );
}
