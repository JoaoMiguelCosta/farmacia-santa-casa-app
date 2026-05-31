// src/features/santacasa/operacao/components/OperacaoMedicacaoHabitualSection/OperacaoMedicacaoHabitualSection.jsx
import MedicacaoHabitualManager from "../../../medicacao-habitual/components/MedicacaoHabitualManager/MedicacaoHabitualManager";

import { OPERACAO_PAGE } from "../../config/operacaoPage.config";

import OperationSection from "../OperationSection/OperationSection";

export default function OperacaoMedicacaoHabitualSection({
  selectedUtenteId,
  selectedUtente,
  medicacaoHabitualController,
}) {
  const section = OPERACAO_PAGE.sections.medicacaoHabitual;

  return (
    <OperationSection
      id={section.id}
      eyebrow={section.eyebrow}
      title={section.title}
      description={section.description}
    >
      <MedicacaoHabitualManager
        selectedUtenteId={selectedUtenteId}
        selectedUtente={selectedUtente}
        controller={medicacaoHabitualController}
      />
    </OperationSection>
  );
}
