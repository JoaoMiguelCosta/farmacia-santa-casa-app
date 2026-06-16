// src/features/santacasa/operacao/utils/operacaoDelete.utils.js
import { RECEITAS_PAGE } from "../../receitas/config/receitasPage.config";
import { SEM_RECEITA_PAGE } from "../../semReceita/config/semReceitaPage.config";
import { EXTRAS_PAGE } from "../../extras/config/extrasPage.config";

export function getDeleteTargetKey(target) {
  if (!target) return "";

  if (target.kind === "receita") {
    return `receita:${target.item.linhaId}`;
  }

  if (target.kind === "semReceita") {
    return `semReceita:${target.item.id}`;
  }

  if (target.kind === "extra") {
    return `extra:${target.item.id}`;
  }

  return "";
}

export function getDeletingId(deletingKey, kind) {
  if (!deletingKey?.startsWith(`${kind}:`)) return null;

  return deletingKey.slice(kind.length + 1);
}

export function getPedidoKeyFromDeleteTarget(target) {
  if (!target) return "";

  if (target.kind === "receita") {
    return `COM_RECEITA:${target.item.linhaId}`;
  }

  if (target.kind === "semReceita") {
    return `SEM_RECEITA:${target.item.id}`;
  }

  if (target.kind === "extra") {
    return `EXTRA:${target.item.id}`;
  }

  return "";
}

export function getDeleteDialogData(target) {
  if (!target) {
    return {
      title: "Remover item?",
      description: "Esta ação pode ser bloqueada se o item tiver histórico.",
      confirmLabel: "Remover",
      cancelLabel: "Cancelar",
    };
  }

  if (target.kind === "receita") {
    return {
      ...RECEITAS_PAGE.deleteDialog,
      description: `${RECEITAS_PAGE.deleteDialog.description} Medicamento: ${target.item.medicamento}.`,
    };
  }

  if (target.kind === "semReceita") {
    return {
      ...SEM_RECEITA_PAGE.deleteDialog,
      description: `${SEM_RECEITA_PAGE.deleteDialog.description} Medicamento: ${target.item.medicamento}.`,
    };
  }

  return {
    ...EXTRAS_PAGE.deleteDialog,
    description: `${EXTRAS_PAGE.deleteDialog.description} Medicamento: ${target.item.medicamento}.`,
  };
}

export function getDeleteSuccessMessage(target) {
  if (target?.kind === "receita") {
    return RECEITAS_PAGE.list.deleteSuccessMessage;
  }

  if (target?.kind === "semReceita") {
    return SEM_RECEITA_PAGE.list.deleteSuccessMessage;
  }

  return EXTRAS_PAGE.list.deleteSuccessMessage;
}
