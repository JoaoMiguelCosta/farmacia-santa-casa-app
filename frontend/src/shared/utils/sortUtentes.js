const collator = new Intl.Collator("pt-PT", {
  sensitivity: "base",
  numeric: true,
});

function getNameParts(nome) {
  return String(nome || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function sortUtentesByName(utentes = []) {
  return [...utentes].sort((a, b) => {
    const aParts = getNameParts(a.nome);
    const bParts = getNameParts(b.nome);

    const firstNameCompare = collator.compare(aParts[0] || "", bParts[0] || "");

    if (firstNameCompare !== 0) {
      return firstNameCompare;
    }

    const secondNameFirstLetterCompare = collator.compare(
      (aParts[1] || "").charAt(0),
      (bParts[1] || "").charAt(0),
    );

    if (secondNameFirstLetterCompare !== 0) {
      return secondNameFirstLetterCompare;
    }

    return collator.compare(a.nome || "", b.nome || "");
  });
}
