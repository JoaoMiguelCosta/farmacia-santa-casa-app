import { useEffect, useMemo, useRef, useState } from "react";

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
  resetKey = 0,
}) {
  const previousResetKeyRef = useRef(resetKey);

  const [formState, setFormState] = useState(() => ({
    resetKey,
    values: createInitialForm(),
    errors: {},
  }));

  const values = formState.values;
  const errors = formState.errors;

  const todayInputValue = useMemo(() => getTodayInputValue(), []);
  const isDisabled = !selectedUtenteId || isSubmitting;

  useEffect(() => {
    if (previousResetKeyRef.current === resetKey) return;

    previousResetKeyRef.current = resetKey;

    setFormState({
      resetKey,
      values: createInitialForm(),
      errors: {},
    });
  }, [resetKey]);

  function updateField(name, value) {
    const nextValue =
      name === "numero19"
        ? onlyDigits(value, 19)
        : name === "pinAcesso6"
          ? onlyDigits(value, 6)
          : name === "pinOpcao4"
            ? onlyDigits(value, 4)
            : value;

    setFormState((currentState) => ({
      resetKey,
      values: {
        ...currentState.values,
        [name]: nextValue,
      },
      errors: {
        ...currentState.errors,
        [name]: "",
      },
    }));
  }

  function updateLine(index, name, value) {
    setFormState((currentState) => ({
      resetKey,
      values: {
        ...currentState.values,
        linhas: currentState.values.linhas.map((linha, linhaIndex) =>
          linhaIndex === index
            ? {
                ...linha,
                [name]: name === "quantidade" ? onlyDigits(value, 3) : value,
              }
            : linha,
        ),
      },
      errors: {
        ...currentState.errors,
        [`linhas.${index}.${name}`]: "",
      },
    }));
  }

  function addLine() {
    setFormState((currentState) => ({
      resetKey,
      values: {
        ...currentState.values,
        linhas: [...currentState.values.linhas, createLine()],
      },
      errors: currentState.errors,
    }));
  }

  function removeLine(index) {
    setFormState((currentState) => ({
      resetKey,
      values: {
        ...currentState.values,
        linhas:
          currentState.values.linhas.length === 1
            ? currentState.values.linhas
            : currentState.values.linhas.filter(
                (_, linhaIndex) => linhaIndex !== index,
              ),
      },
      errors: {},
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(values, todayInputValue);

    if (Object.keys(nextErrors).length > 0) {
      setFormState({
        resetKey,
        values,
        errors: nextErrors,
      });

      return;
    }

    const result = await onCreate(normalizePayload(values));

    if (!result?.ok) {
      setFormState((currentState) => ({
        resetKey,
        values: currentState.values,
        errors: {
          ...currentState.errors,
          ...(result?.fieldErrors || {}),
        },
      }));

      return;
    }

    setFormState({
      resetKey,
      values: createInitialForm(),
      errors: {},
    });
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
