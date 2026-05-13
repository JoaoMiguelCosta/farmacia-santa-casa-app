const collator = new Intl.Collator("pt-PT", {
  sensitivity: "base",
  numeric: true,
});

export function sortReceitasByMedicamento(receitas = []) {
  return [...receitas].sort((a, b) => {
    const receitaCompare = collator.compare(a.numero19 || "", b.numero19 || "");

    if (receitaCompare !== 0) {
      return receitaCompare;
    }

    const medicamentoCompare = collator.compare(
      a.medicamento || "",
      b.medicamento || "",
    );

    if (medicamentoCompare !== 0) {
      return medicamentoCompare;
    }

    return collator.compare(a.linhaId || "", b.linhaId || "");
  });
}
