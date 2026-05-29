const collator = new Intl.Collator("pt-PT", {
  sensitivity: "base",
  numeric: true,
});

export function normalizeMedicationName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function getMedicacaoHabitualName(item) {
  return String(item?.medicamento || item?.nome || "").trim();
}

export function sortMedicacaoHabitualByName(items = []) {
  return [...items].sort((a, b) => {
    const medicamentoCompare = collator.compare(
      getMedicacaoHabitualName(a),
      getMedicacaoHabitualName(b),
    );

    if (medicamentoCompare !== 0) {
      return medicamentoCompare;
    }

    return collator.compare(a?.id || "", b?.id || "");
  });
}

export function hasMedicacaoHabitual(items = []) {
  return Array.isArray(items) && items.length > 0;
}

export function buildMedicacaoHabitualPayload(value) {
  return {
    medicamento: String(value || "").trim(),
  };
}

export function validateMedicacaoHabitualValue(value) {
  const medicamento = String(value || "").trim();

  if (!medicamento) {
    return "O medicamento é obrigatório.";
  }

  if (medicamento.length > 160) {
    return "O medicamento não pode exceder 160 caracteres.";
  }

  return "";
}

export function isDuplicateMedicacaoHabitual(items = [], value) {
  const normalizedValue = normalizeMedicationName(value);

  if (!normalizedValue) return false;

  return items.some((item) => {
    return (
      normalizeMedicationName(getMedicacaoHabitualName(item)) ===
      normalizedValue
    );
  });
}

export function buildMedicacaoHabitualOptions(items = []) {
  return sortMedicacaoHabitualByName(items).map((item) => ({
    id: item.id,
    value: item.medicamento,
    label: item.medicamento,
  }));
}
