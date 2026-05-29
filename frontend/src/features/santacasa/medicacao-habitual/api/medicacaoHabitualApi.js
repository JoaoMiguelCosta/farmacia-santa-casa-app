import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

function normalizeMedicacaoHabitualResponse(response) {
  return Array.isArray(response?.data) ? response.data : [];
}

export async function getMedicacaoHabitualByUtente(utenteId) {
  if (!utenteId) return [];

  const response = await httpClient.get(
    API_ENDPOINTS.santacasa.medicacaoHabitual(utenteId),
  );

  return normalizeMedicacaoHabitualResponse(response);
}

export async function createMedicacaoHabitual(utenteId, payload) {
  if (!utenteId) return null;

  const response = await httpClient.post(
    API_ENDPOINTS.santacasa.medicacaoHabitual(utenteId),
    payload,
  );

  return response?.data ?? null;
}

export async function deleteMedicacaoHabitual(utenteId, medicacaoId) {
  if (!utenteId || !medicacaoId) return false;

  await httpClient.delete(
    API_ENDPOINTS.santacasa.medicacaoHabitualById(utenteId, medicacaoId),
  );

  return true;
}

export async function clearMedicacaoHabitual(utenteId) {
  if (!utenteId) return false;

  await httpClient.delete(API_ENDPOINTS.santacasa.medicacaoHabitual(utenteId));

  return true;
}
