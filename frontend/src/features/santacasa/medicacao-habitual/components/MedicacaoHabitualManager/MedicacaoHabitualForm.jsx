// src/features/santacasa/medicacao-habitual/components/MedicacaoHabitualManager/MedicacaoHabitualForm.jsx
import Button from "../../../../../shared/ui/Button/Button";
import FormField from "../../../../../shared/ui/FormField/FormField";

import { MEDICACAO_HABITUAL_CONFIG } from "../../config/medicacaoHabitual.config";

import styles from "./MedicacaoHabitualForm.module.css";

export default function MedicacaoHabitualForm({
  medicamentoInput,
  inputError,
  isCreating,
  isClearing,
  onSubmit,
  onInputChange,
}) {
  const form = MEDICACAO_HABITUAL_CONFIG.form;
  const field = MEDICACAO_HABITUAL_CONFIG.fields.medicamento;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.intro}>
        <h3>{form.title}</h3>
        <p>{form.description}</p>
      </div>

      <div className={styles.grid}>
        <FormField
          id={field.id}
          label={field.label}
          hint={field.hint}
          error={inputError}
          required
        >
          <input
            id={field.id}
            type="text"
            placeholder={field.placeholder}
            value={medicamentoInput}
            disabled={isCreating || isClearing}
            autoComplete="off"
            onChange={(event) => onInputChange(event.target.value)}
          />
        </FormField>

        <div className={styles.action}>
          <Button
            type="submit"
            isLoading={isCreating}
            disabled={isCreating || isClearing}
          >
            {isCreating ? form.submittingLabel : form.submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
