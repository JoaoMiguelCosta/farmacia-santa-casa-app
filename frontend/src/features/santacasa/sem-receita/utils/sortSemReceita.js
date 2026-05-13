const collator = new Intl.Collator("pt-PT", {
  sensitivity: "base",
  numeric: true,
});

export function sortSemReceitaByMedicamento(items = []) {
  return [...items].sort((a, b) => {
    const medicamentoCompare = collator.compare(
      a.medicamento || "",
      b.medicamento || "",
    );

    if (medicamentoCompare !== 0) {
      return medicamentoCompare;
    }

    return collator.compare(a.id || "", b.id || "");
  });
}
