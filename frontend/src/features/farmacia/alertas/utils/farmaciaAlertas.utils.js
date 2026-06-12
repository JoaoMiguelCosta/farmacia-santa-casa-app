import { FARMACIA_ALERTAS_CONFIG } from "../config/farmaciaAlertas.config";

export function sortAlertasByDate(alertas = []) {
  return [...alertas].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getSafeErrorMessage(error, fallbackMessage) {
  return error?.message || fallbackMessage;
}

export function getAlertTypeConfig(tipo) {
  return (
    FARMACIA_ALERTAS_CONFIG.types[tipo] || FARMACIA_ALERTAS_CONFIG.fallbackType
  );
}

export function getAlertTone(alerta) {
  return getAlertTypeConfig(alerta?.tipo).tone;
}

export function getAlertasCountLabel(count) {
  if (count === 1) {
    return FARMACIA_ALERTAS_CONFIG.labels.countSingular;
  }

  return `${count} ${FARMACIA_ALERTAS_CONFIG.labels.countPlural}`;
}

export function getAlertActionConfig(alerta) {
  const typeConfig = getAlertTypeConfig(alerta?.tipo);

  return {
    label: typeConfig.actionLabel,
    to: typeConfig.to,
  };
}
