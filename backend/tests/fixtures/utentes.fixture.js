function createUniqueUtentePayload(prefix = "Utente Teste") {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return {
    numero9: String(Math.floor(100000000 + Math.random() * 900000000)),
    nome: `${prefix} ${timestamp} ${random}`,
  };
}

module.exports = {
  createUniqueUtentePayload,
};
