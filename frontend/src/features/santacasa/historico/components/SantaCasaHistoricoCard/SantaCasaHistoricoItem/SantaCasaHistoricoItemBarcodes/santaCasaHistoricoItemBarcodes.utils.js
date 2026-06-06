// src/features/santacasa/historico/components/SantaCasaHistoricoCard/SantaCasaHistoricoItem/SantaCasaHistoricoItemBarcodes/santaCasaHistoricoItemBarcodes.utils.js

import { SANTACASA_HISTORICO_PAGE } from "../../../../config/santaCasaHistoricoPage.config";

function getClassName(classNames) {
  return classNames.filter(Boolean).join(" ");
}

export function getHistoricoReceitaBarcodeItems(receita) {
  return [
    {
      key: "numero19",
      label: SANTACASA_HISTORICO_PAGE.labels.receitaNumber,
      value: receita?.numero19,
      width: 0.72,
    },
    {
      key: "pinAcesso6",
      label: SANTACASA_HISTORICO_PAGE.labels.pinAcesso,
      value: receita?.pinAcesso6,
      width: 1.08,
    },
    {
      key: "pinOpcao4",
      label: SANTACASA_HISTORICO_PAGE.labels.pinOpcao,
      value: receita?.pinOpcao4,
      width: 1.16,
    },
  ].filter((code) => code.value);
}

export function getBarcodePanelClassName(isDanger, styles) {
  return getClassName([
    styles.barcodePanel,
    isDanger ? styles.barcodePanelDanger : "",
  ]);
}

export function getReceitaBarcodesAriaLabel() {
  return SANTACASA_HISTORICO_PAGE.labels.receitaBarcodesAriaLabel;
}
