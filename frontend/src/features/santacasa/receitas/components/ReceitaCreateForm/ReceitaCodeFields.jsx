// src/features/santacasa/receitas/components/ReceitaCreateForm/ReceitaCodeFields.jsx
import FormField from "../../../../../shared/ui/FormField/FormField";

import { RECEITAS_PAGE } from "../../config/receitasPage.config";

import styles from "./ReceitaCodeFields.module.css";

export default function ReceitaCodeFields({
  values,
  errors,
  isDisabled,
  onFieldChange,
}) {
  return (
    <div className={styles.recipeGrid}>
      <FormField
        id={RECEITAS_PAGE.fields.numero19.id}
        label={RECEITAS_PAGE.fields.numero19.label}
        hint={RECEITAS_PAGE.fields.numero19.hint}
        error={errors.numero19}
        required
      >
        <input
          id={RECEITAS_PAGE.fields.numero19.id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={RECEITAS_PAGE.fields.numero19.placeholder}
          value={values.numero19}
          onChange={(event) => onFieldChange("numero19", event.target.value)}
          disabled={isDisabled}
          autoComplete="off"
        />
      </FormField>

      <FormField
        id={RECEITAS_PAGE.fields.pinAcesso6.id}
        label={RECEITAS_PAGE.fields.pinAcesso6.label}
        hint={RECEITAS_PAGE.fields.pinAcesso6.hint}
        error={errors.pinAcesso6}
        required
      >
        <input
          id={RECEITAS_PAGE.fields.pinAcesso6.id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={RECEITAS_PAGE.fields.pinAcesso6.placeholder}
          value={values.pinAcesso6}
          onChange={(event) => onFieldChange("pinAcesso6", event.target.value)}
          disabled={isDisabled}
          autoComplete="off"
        />
      </FormField>

      <FormField
        id={RECEITAS_PAGE.fields.pinOpcao4.id}
        label={RECEITAS_PAGE.fields.pinOpcao4.label}
        hint={RECEITAS_PAGE.fields.pinOpcao4.hint}
        error={errors.pinOpcao4}
        required
      >
        <input
          id={RECEITAS_PAGE.fields.pinOpcao4.id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={RECEITAS_PAGE.fields.pinOpcao4.placeholder}
          value={values.pinOpcao4}
          onChange={(event) => onFieldChange("pinOpcao4", event.target.value)}
          disabled={isDisabled}
          autoComplete="off"
        />
      </FormField>
    </div>
  );
}
