// src/features/santacasa/shared/components/MedicamentoAutocomplete/medicamentoAutocomplete.utils.js
export function normalizeSearchValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

export function normalizeOptions(options = []) {
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

export function getFilteredOptions(options, value) {
  const normalizedValue = normalizeSearchValue(value);

  if (!normalizedValue) {
    return options;
  }

  return options.filter((option) => {
    return normalizeSearchValue(`${option.label} ${option.value}`).includes(
      normalizedValue,
    );
  });
}

export function getNextActiveIndex({ currentIndex, direction, total }) {
  if (total <= 0) return -1;

  if (currentIndex < 0) {
    return direction > 0 ? 0 : total - 1;
  }

  return (currentIndex + direction + total) % total;
}

export function getResolvedActiveIndex({ activeIndex, total, isOpen }) {
  if (!isOpen || total <= 0) return -1;

  if (activeIndex < 0 || activeIndex >= total) {
    return 0;
  }

  return activeIndex;
}

export function getOptionClassName({ styles, isActive }) {
  return [styles.option, isActive ? styles.active : ""]
    .filter(Boolean)
    .join(" ");
}

export function getOptionElementId({ listboxId, index }) {
  return `${listboxId}-option-${index}`;
}
