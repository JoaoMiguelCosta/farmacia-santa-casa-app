import { DATA_STATE_CONFIG } from "./DataState.config";

export function getSafeDataStateType(type) {
  if (Object.prototype.hasOwnProperty.call(DATA_STATE_CONFIG.types, type)) {
    return type;
  }

  return DATA_STATE_CONFIG.fallbackType;
}

export function getDataStateTypeConfig(type) {
  const stateType = getSafeDataStateType(type);

  return DATA_STATE_CONFIG.types[stateType];
}
