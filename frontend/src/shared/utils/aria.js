export function mergeAriaIds(...ids) {
  return ids.filter(Boolean).join(" ") || undefined;
}
