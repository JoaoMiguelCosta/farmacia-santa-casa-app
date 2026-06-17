// src/features/santacasa/operacao/components/OperacaoUtenteCombobox/operacaoUtenteCombobox.utils.js
export function normalizeSearchValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

export function getUtenteLabel(utente) {
  if (!utente) return "";

  return `${utente.nome} — ${utente.numero9}`;
}

export function getUtenteSearchValue(utente) {
  return normalizeSearchValue(`${utente.nome} ${utente.numero9}`);
}

export function getFilteredUtentes(utentes = [], searchTerm = "") {
  const normalizedSearch = normalizeSearchValue(searchTerm);

  if (!normalizedSearch) {
    return utentes;
  }

  return utentes.filter((utente) => {
    return getUtenteSearchValue(utente).includes(normalizedSearch);
  });
}

export function getInitialActiveIndex(total) {
  return total > 0 ? 0 : -1;
}

export function getActiveIndexAfterMove({ currentIndex, direction, total }) {
  if (total <= 0) return -1;

  if (currentIndex < 0) {
    return direction > 0 ? 0 : total - 1;
  }

  return (currentIndex + direction + total) % total;
}

export function getOptionClassName({ styles, isSelected, isActive }) {
  return [
    styles.option,
    isSelected ? styles.selected : "",
    isActive ? styles.active : "",
  ]
    .filter(Boolean)
    .join(" ");
}
