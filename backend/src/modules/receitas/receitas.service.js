// src/modules/receitas/receitas.service.js
const receitasRepository = require("./receitas.repository");
const utentesRepository = require("../utentes/utentes.repository");

const {
  toReceitaLinhaDTO,
  toReceitaCreatedDTO,
} = require("./receitas.mappers");

const { validateCreateReceitaPayload } = require("./receitas.validators");

const { assertUtenteOperational } = require("../utentes/utentes.guards");

const {
  conflict,
  forbidden,
  notFound,
} = require("../../shared/errors/AppError");

async function ensureUtenteOperational(utenteId, actionLabel) {
  const utente = await utentesRepository.findById(utenteId);

  return assertUtenteOperational(utente, actionLabel);
}

async function listByUtente(utenteId) {
  await ensureUtenteOperational(utenteId, "consultar receitas deste utente");

  const rows = await receitasRepository.findLinhasByUtente(utenteId);

  return rows
    .map(toReceitaLinhaDTO)
    .filter((linha) => linha.quantidadeRestante > 0);
}

async function createForUtente(utenteId, payload) {
  await ensureUtenteOperational(utenteId, "criar receita para este utente");

  const data = validateCreateReceitaPayload(payload);

  const existingReceita = await receitasRepository.findReceitaByNumero19(
    data.numero19,
  );

  if (existingReceita) {
    throw conflict("Já existe uma receita com esse número.");
  }

  const result = await receitasRepository.createReceitaWithLinhas(
    utenteId,
    data,
  );

  return toReceitaCreatedDTO(
    result.receita,
    result.linhas,
    result.extrasResolvidos,
  );
}

async function removeLinhaForUtente(utenteId, linhaId) {
  await ensureUtenteOperational(
    utenteId,
    "remover linha de receita deste utente",
  );

  const linha = await receitasRepository.findLinhaById(linhaId);

  if (!linha) {
    throw notFound("Linha de receita não encontrada.");
  }

  if (linha.receita?.utenteId !== utenteId) {
    throw forbidden("Linha de receita não pertence a este utente.");
  }

  if (Number(linha.quantidadeDispensada || 0) > 0) {
    throw conflict(
      "Não é possível remover: esta linha já tem unidades dispensadas.",
    );
  }

  const [dispensas, pedidoItems, regularizacoes] = await Promise.all([
    receitasRepository.countDispensasByLinha(linhaId),
    receitasRepository.countPedidoItemsByLinha(linhaId),
    receitasRepository.countRegularizacaoEventosByLinha(linhaId),
  ]);

  if (dispensas > 0) {
    throw conflict(
      "Não é possível remover: esta linha já tem dispensas associadas.",
    );
  }

  if (pedidoItems > 0) {
    throw conflict(
      "Não é possível remover: esta linha já está associada a pedidos.",
    );
  }

  if (regularizacoes > 0) {
    throw conflict(
      "Não é possível remover: esta linha já foi usada em regularizações.",
    );
  }

  await receitasRepository.deleteLinhaAndMaybeReceita(
    linha.id,
    linha.receitaId,
  );
}

module.exports = {
  listByUtente,
  createForUtente,
  removeLinhaForUtente,
};
