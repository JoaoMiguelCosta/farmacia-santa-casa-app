// src/features/santacasa/shared/components/MedicamentoAutocomplete/useMedicamentoAutocomplete.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getFilteredOptions,
  getNextActiveIndex,
  getResolvedActiveIndex,
  normalizeOptions,
} from "./medicamentoAutocomplete.utils";

export function useMedicamentoAutocomplete({
  id,
  value = "",
  options = [],
  disabled = false,
  onChange,
}) {
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const normalizedOptions = useMemo(() => normalizeOptions(options), [options]);

  const filteredOptions = useMemo(
    () => getFilteredOptions(normalizedOptions, value),
    [normalizedOptions, value],
  );

  const hasOptions = normalizedOptions.length > 0;
  const hasResults = filteredOptions.length > 0;

  const resolvedActiveIndex = getResolvedActiveIndex({
    activeIndex,
    total: filteredOptions.length,
    isOpen,
  });

  const listboxId = `${id}-options`;

  const openDropdown = useCallback(() => {
    if (disabled || !hasOptions) return;

    setIsOpen(true);
    setActiveIndex(filteredOptions.length > 0 ? 0 : -1);
  }, [disabled, filteredOptions.length, hasOptions]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const toggleDropdown = useCallback(() => {
    if (disabled || !hasOptions) return;

    if (isOpen) {
      closeDropdown();
      inputRef.current?.focus();
      return;
    }

    openDropdown();
    inputRef.current?.focus();
  }, [closeDropdown, disabled, hasOptions, isOpen, openDropdown]);

  const handleInputChange = useCallback(
    (event) => {
      const nextValue = event.target.value;
      const nextFilteredOptions = getFilteredOptions(
        normalizedOptions,
        nextValue,
      );

      onChange?.(nextValue);

      if (!disabled && normalizedOptions.length > 0) {
        setIsOpen(true);
        setActiveIndex(nextFilteredOptions.length > 0 ? 0 : -1);
      }
    },
    [disabled, normalizedOptions, onChange],
  );

  const handleOptionSelect = useCallback(
    (option) => {
      onChange?.(option.value);
      closeDropdown();
      inputRef.current?.focus();
    },
    [closeDropdown, onChange],
  );

  const handleInputFocus = useCallback(() => {
    openDropdown();
  }, [openDropdown]);

  const handleToggleMouseDown = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleInputKeyDown = useCallback(
    (event) => {
      if (disabled || !hasOptions) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();

        if (!isOpen) {
          openDropdown();
          return;
        }

        setActiveIndex((currentIndex) =>
          getNextActiveIndex({
            currentIndex,
            direction: 1,
            total: filteredOptions.length,
          }),
        );

        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        if (!isOpen) {
          openDropdown();
          return;
        }

        setActiveIndex((currentIndex) =>
          getNextActiveIndex({
            currentIndex,
            direction: -1,
            total: filteredOptions.length,
          }),
        );

        return;
      }

      if (event.key === "Escape") {
        if (!isOpen) return;

        event.preventDefault();
        closeDropdown();
        return;
      }

      if (event.key === "Enter" && isOpen) {
        const activeOption = filteredOptions[resolvedActiveIndex];

        if (!activeOption) return;

        event.preventDefault();
        handleOptionSelect(activeOption);
      }
    },
    [
      closeDropdown,
      disabled,
      filteredOptions,
      handleOptionSelect,
      hasOptions,
      isOpen,
      openDropdown,
      resolvedActiveIndex,
    ],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        closeDropdown();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeDropdown, isOpen]);

  return {
    wrapperRef,
    inputRef,

    isOpen,
    activeIndex,
    filteredOptions,
    hasOptions,
    hasResults,
    resolvedActiveIndex,
    listboxId,

    handleInputChange,
    handleInputFocus,
    handleInputKeyDown,
    handleOptionSelect,
    handleToggleMouseDown,
    toggleDropdown,
    setActiveIndex,
  };
}
