// src/features/santacasa/operacao/utils/santaCasaOperacao.utils.js
export {
  getDeleteDialogData,
  getDeleteSuccessMessage,
  getDeleteTargetKey,
  getDeletingId,
  getPedidoKeyFromDeleteTarget,
} from "./operacaoDelete.utils.js";

export {
  formatUnitsLabel,
  formatVerbByQuantity,
  getItemMedicationName,
  getOriginListLabel,
  isSameMedication,
  normalizeMedicationName,
} from "./operacaoMedicamento.utils.js";

export {
  buildAddToPedidoMessage,
  buildReceitaRegularizacaoMessage,
  buildReceitaSuccessMessage,
  buildResolvedExtrasMessage,
} from "./operacaoMessages.utils.js";

export {
  buildDraftQuantityMap,
  buildGlobalDraftItem,
  buildReceitaDraftItems,
  getExtraPedidoKey,
  getExtraQuantidadeRestante,
  getQuantidadeDisponivelVisual,
  getReceitaPedidoKey,
  getSemReceitaPedidoKey,
} from "./operacaoPedido.utils.js";

export {
  getCreatedReceitaLinhas,
  getLinhaQuantidadeRegularizada,
  getLinhaQuantidadeRestante,
  getReceitaFieldErrors,
  getRegularizacaoConfirmationDetails,
  getResolvedExtraKeys,
  isRegularizacaoConfirmationRequired,
  REGULARIZACAO_CONFIRMATION_REQUIRED,
  buildRegularizacaoConfirmationDescription,
} from "./operacaoRegularizacao.utils.js";
