const collator = new Intl.Collator("pt-PT", {
  sensitivity: "base",
  numeric: true,
});

function getReceitaValidadeTime(receita) {
  const time = new Date(receita?.validade).getTime();

  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

export function sortReceitasByMedicamento(receitas = []) {
  return [...receitas].sort((a, b) => {
    const medicamentoCompare = collator.compare(
      a.medicamento || "",
      b.medicamento || "",
    );

    if (medicamentoCompare !== 0) {
      return medicamentoCompare;
    }

    const validadeCompare =
      getReceitaValidadeTime(a) - getReceitaValidadeTime(b);

    if (validadeCompare !== 0) {
      return validadeCompare;
    }

    const receitaCompare = collator.compare(a.numero19 || "", b.numero19 || "");

    if (receitaCompare !== 0) {
      return receitaCompare;
    }

    return collator.compare(a.linhaId || "", b.linhaId || "");
  });
}
