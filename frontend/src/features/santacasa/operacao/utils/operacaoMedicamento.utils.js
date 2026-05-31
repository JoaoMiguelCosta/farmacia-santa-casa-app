// src/features/santacasa/operacao/utils/operacaoMedicamento.utils.js
export function normalizeMedicationName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function getItemMedicationName(item) {
  return (
    item?.medicamento ||
    item?.nome ||
    item?.title ||
    item?.source?.medicamento ||
    item?.source?.nome ||
    ""
  );
}

export function isSameMedication(a, b) {
  return (
    normalizeMedicationName(getItemMedicationName(a)) ===
    normalizeMedicationName(getItemMedicationName(b))
  );
}

export function formatUnitsLabel(quantity) {
  const amount = Number(quantity) || 0;

  return amount === 1 ? "1 unidade" : `${amount} unidades`;
}

export function formatVerbByQuantity(quantity, singular, plural) {
  return Number(quantity) === 1 ? singular : plural;
}

export function getOriginListLabel(tipo) {
  if (tipo === "COM_RECEITA") return "Receitas";

  if (tipo === "SEM_RECEITA") {
    return "Medicamentos não sujeitos a receita médica";
  }

  if (tipo === "EXTRA") return "Vendas Suspensas";

  return "lista correspondente";
}
