import { useMemo, useState } from "react";

import Button from "../../../../../shared/ui/Button/Button";
import FormField from "../../../../../shared/ui/FormField/FormField";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { RECEITAS_PAGE } from "../../config/receitasPage.config";

import styles from "./ReceitaCreateForm.module.css";

const INITIAL_LINE = Object.freeze({
  medicamento: "",
  quantidade: "1",
  validade: "",
});

const INITIAL_FORM = Object.freeze({
  numero19: "",
  pinAcesso6: "",
  pinOpcao4: "",
  linhas: [{ ...INITIAL_LINE }],
});

function onlyDigits(value, maxLength) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, maxLength);
}

function getTodayInputValue() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60_000;
  const localToday = new Date(today.getTime() - timezoneOffset);

  return localToday.toISOString().slice(0, 10);
}

function isDateBeforeToday(value, todayInputValue) {
  if (!value) return false;

  return value < todayInputValue;
}

function validateForm(values, todayInputValue) {
  const errors = {};

  if (!/^\d{19}$/.test(values.numero19)) {
    errors.numero19 = "O número da receita deve ter exatamente 19 dígitos.";
  }

  if (!/^\d{6}$/.test(values.pinAcesso6)) {
    errors.pinAcesso6 = "O PIN de acesso deve ter exatamente 6 dígitos.";
  }

  if (!/^\d{4}$/.test(values.pinOpcao4)) {
    errors.pinOpcao4 = "O PIN de opção deve ter exatamente 4 dígitos.";
  }

  values.linhas.forEach((linha, index) => {
    const prefix = `linhas.${index}`;

    if (!linha.medicamento.trim()) {
      errors[`${prefix}.medicamento`] = "O medicamento é obrigatório.";
    }

    const quantidade = Number(linha.quantidade);

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      errors[`${prefix}.quantidade`] = "A quantidade deve ser maior que 0.";
    }

    if (!linha.validade) {
      errors[`${prefix}.validade`] = "A validade é obrigatória.";
    } else if (isDateBeforeToday(linha.validade, todayInputValue)) {
      errors[`${prefix}.validade`] =
        "A validade não pode ser anterior ao dia atual.";
    }
  });

  return errors;
}

function normalizePayload(values) {
  return {
    numero19: values.numero19,
    pinAcesso6: values.pinAcesso6,
    pinOpcao4: values.pinOpcao4,
    linhas: values.linhas.map((linha) => ({
      medicamento: linha.medicamento.trim(),
      quantidade: Number(linha.quantidade),
      validade: linha.validade,
    })),
  };
}

export default function ReceitaCreateForm({
  selectedUtenteId,
  onCreate,
  isSubmitting = false,
}) {
  const [values, setValues] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const todayInputValue = useMemo(() => getTodayInputValue(), []);
  const isDisabled = !selectedUtenteId || isSubmitting;

  function updateField(name, value) {
    const nextValue =
      name === "numero19"
        ? onlyDigits(value, 19)
        : name === "pinAcesso6"
          ? onlyDigits(value, 6)
          : name === "pinOpcao4"
            ? onlyDigits(value, 4)
            : value;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: nextValue,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
  }

  function updateLine(index, name, value) {
    setValues((currentValues) => ({
      ...currentValues,
      linhas: currentValues.linhas.map((linha, linhaIndex) =>
        linhaIndex === index
          ? {
              ...linha,
              [name]: name === "quantidade" ? onlyDigits(value, 3) : value,
            }
          : linha,
      ),
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [`linhas.${index}.${name}`]: "",
    }));
  }

  function addLine() {
    setValues((currentValues) => ({
      ...currentValues,
      linhas: [...currentValues.linhas, { ...INITIAL_LINE }],
    }));
  }

  function removeLine(index) {
    setValues((currentValues) => ({
      ...currentValues,
      linhas:
        currentValues.linhas.length === 1
          ? currentValues.linhas
          : currentValues.linhas.filter(
              (_, linhaIndex) => linhaIndex !== index,
            ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(values, todayInputValue);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const result = await onCreate(normalizePayload(values));

    if (!result?.ok) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        ...(result?.fieldErrors || {}),
      }));

      return;
    }

    setValues(INITIAL_FORM);
    setErrors({});
  }

  return (
    <SurfaceCard
      title={RECEITAS_PAGE.form.title}
      description={RECEITAS_PAGE.form.description}
      tone="green"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {!selectedUtenteId ? (
          <p className={styles.notice}>
            Seleciona um utente antes de criar receita.
          </p>
        ) : null}

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
              placeholder={RECEITAS_PAGE.fields.numero19.placeholder}
              value={values.numero19}
              onChange={(event) => updateField("numero19", event.target.value)}
              disabled={isDisabled}
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
              placeholder={RECEITAS_PAGE.fields.pinAcesso6.placeholder}
              value={values.pinAcesso6}
              onChange={(event) =>
                updateField("pinAcesso6", event.target.value)
              }
              disabled={isDisabled}
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
              placeholder={RECEITAS_PAGE.fields.pinOpcao4.placeholder}
              value={values.pinOpcao4}
              onChange={(event) => updateField("pinOpcao4", event.target.value)}
              disabled={isDisabled}
            />
          </FormField>
        </div>

        <div className={styles.linesHeader}>
          <h3>Linhas da receita</h3>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addLine}
            disabled={isDisabled}
          >
            {RECEITAS_PAGE.form.addLineLabel}
          </Button>
        </div>

        <div className={styles.lines}>
          {values.linhas.map((linha, index) => {
            const baseId = `receita-linha-${index}`;

            return (
              <fieldset key={baseId} className={styles.line}>
                <legend>Linha {index + 1}</legend>

                <div className={styles.lineGrid}>
                  <FormField
                    id={`${baseId}-medicamento`}
                    label={RECEITAS_PAGE.fields.medicamento.label}
                    error={errors[`linhas.${index}.medicamento`]}
                    required
                  >
                    <input
                      id={`${baseId}-medicamento`}
                      type="text"
                      placeholder={RECEITAS_PAGE.fields.medicamento.placeholder}
                      value={linha.medicamento}
                      onChange={(event) =>
                        updateLine(index, "medicamento", event.target.value)
                      }
                      disabled={isDisabled}
                    />
                  </FormField>

                  <FormField
                    id={`${baseId}-quantidade`}
                    label={RECEITAS_PAGE.fields.quantidade.label}
                    error={errors[`linhas.${index}.quantidade`]}
                    required
                  >
                    <input
                      id={`${baseId}-quantidade`}
                      type="text"
                      inputMode="numeric"
                      placeholder={RECEITAS_PAGE.fields.quantidade.placeholder}
                      value={linha.quantidade}
                      onChange={(event) =>
                        updateLine(index, "quantidade", event.target.value)
                      }
                      disabled={isDisabled}
                    />
                  </FormField>

                  <FormField
                    id={`${baseId}-validade`}
                    label={RECEITAS_PAGE.fields.validade.label}
                    error={errors[`linhas.${index}.validade`]}
                    required
                  >
                    <input
                      id={`${baseId}-validade`}
                      type="date"
                      min={todayInputValue}
                      value={linha.validade}
                      onChange={(event) =>
                        updateLine(index, "validade", event.target.value)
                      }
                      disabled={isDisabled}
                    />
                  </FormField>
                </div>

                <div className={styles.lineActions}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(index)}
                    disabled={isDisabled || values.linhas.length === 1}
                  >
                    {RECEITAS_PAGE.form.removeLineLabel}
                  </Button>
                </div>
              </fieldset>
            );
          })}
        </div>

        <div className={styles.actions}>
          <Button type="submit" isLoading={isSubmitting} disabled={isDisabled}>
            {isSubmitting
              ? RECEITAS_PAGE.form.submittingLabel
              : RECEITAS_PAGE.form.submitLabel}
          </Button>
        </div>
      </form>
    </SurfaceCard>
  );
}
