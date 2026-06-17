import { AREA_LANDING_CONFIG } from "./AreaLanding.config";

export function getAreaLandingLabel({ eyebrow, title }) {
  return eyebrow || title || AREA_LANDING_CONFIG.fallbackAreaLabel;
}

export function getAreaLandingModulesLabel(areaLabel) {
  return `${AREA_LANDING_CONFIG.modulesLabelPrefix} — ${areaLabel}`;
}
