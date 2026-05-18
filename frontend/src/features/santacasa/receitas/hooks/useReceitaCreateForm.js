import { useMemo, useState } from "react";

const INITIAL_LINE = Object.freeze({
  medicamento: "",
  quantidade: "1",
  validade: "",
});

function createLineId() {
  return `linha-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createLine() {
  return {
    id: createLineId(),
    ...INITIAL_LINE,
  };
}

function createInitialForm() {
  return {
    numero19: "",
    pinAcesso6: "",
    pinOpcao4: "",
    linhas: [createLine()],
  };
}

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

export function useReceitaCreateForm({
  selectedUtenteId,
  onCreate,
  isSubmitting = false,
}) {
  const [values, setValues] = useState(() => createInitialForm());
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
      linhas: [...currentValues.linhas, createLine()],
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

    setErrors({});
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

    setValues(createInitialForm());
    setErrors({});
  }

  return {
    values,
    errors,

    todayInputValue,
    isDisabled,

    updateField,
    updateLine,
    addLine,
    removeLine,
    handleSubmit,
  };
}
