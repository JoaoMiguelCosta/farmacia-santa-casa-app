// src/features/santacasa/operacao/components/OperacaoUtenteCombobox/useOperacaoUtenteCombobox.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getActiveIndexAfterMove,
  getFilteredUtentes,
  getInitialActiveIndex,
  getUtenteLabel,
} from "./operacaoUtenteCombobox.utils";

export function useOperacaoUtenteCombobox({
  id,
  utentes = [],
  value = "",
  onChange,
  disabled = false,
  placeholder = "Seleciona um utente",
}) {
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const focusFrameIdRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedUtente = useMemo(() => {
    return utentes.find((utente) => utente.id === value) || null;
  }, [utentes, value]);

  const filteredUtentes = useMemo(() => {
    return getFilteredUtentes(utentes, searchTerm);
  }, [searchTerm, utentes]);

  const hasResults = filteredUtentes.length > 0;

  const selectedLabel = selectedUtente
    ? getUtenteLabel(selectedUtente)
    : placeholder;

  const listboxId = `${id}-listbox`;
  const searchInputId = `${id}-search`;

  const cancelScheduledTriggerFocus = useCallback(() => {
    if (focusFrameIdRef.current === null) return;

    window.cancelAnimationFrame(focusFrameIdRef.current);
    focusFrameIdRef.current = null;
  }, []);

  const focusTrigger = useCallback(() => {
    cancelScheduledTriggerFocus();

    focusFrameIdRef.current = window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
      focusFrameIdRef.current = null;
    });
  }, [cancelScheduledTriggerFocus]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchTerm("");
    setActiveIndex(-1);
  }, []);

  const openDropdown = useCallback(() => {
    if (disabled) return;

    setIsOpen(true);
    setActiveIndex(getInitialActiveIndex(filteredUtentes.length));
  }, [disabled, filteredUtentes.length]);

  const toggleDropdown = useCallback(() => {
    if (disabled) return;

    if (isOpen) {
      closeDropdown();
      return;
    }

    setIsOpen(true);
    setActiveIndex(getInitialActiveIndex(filteredUtentes.length));
  }, [closeDropdown, disabled, filteredUtentes.length, isOpen]);

  const selectUtente = useCallback(
    (utente) => {
      onChange?.(utente.id);
      closeDropdown();
      focusTrigger();
    },
    [closeDropdown, focusTrigger, onChange],
  );

  const handleSearchChange = useCallback(
    (event) => {
      const nextSearchTerm = event.target.value;
      const nextFilteredUtentes = getFilteredUtentes(utentes, nextSearchTerm);

      setSearchTerm(nextSearchTerm);
      setActiveIndex(getInitialActiveIndex(nextFilteredUtentes.length));
    },
    [utentes],
  );

  const handleTriggerKeyDown = useCallback(
    (event) => {
      if (disabled) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        openDropdown();
        setActiveIndex(getInitialActiveIndex(filteredUtentes.length));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        openDropdown();
        setActiveIndex(
          filteredUtentes.length > 0 ? filteredUtentes.length - 1 : -1,
        );
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleDropdown();
      }
    },
    [disabled, filteredUtentes.length, openDropdown, toggleDropdown],
  );

  const handleSearchKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDropdown();
        focusTrigger();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();

        setActiveIndex((currentIndex) =>
          getActiveIndexAfterMove({
            currentIndex,
            direction: 1,
            total: filteredUtentes.length,
          }),
        );

        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        setActiveIndex((currentIndex) =>
          getActiveIndexAfterMove({
            currentIndex,
            direction: -1,
            total: filteredUtentes.length,
          }),
        );

        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();

        const activeUtente = filteredUtentes[activeIndex];

        if (activeUtente) {
          selectUtente(activeUtente);
        }
      }
    },
    [activeIndex, closeDropdown, filteredUtentes, focusTrigger, selectUtente],
  );

  useEffect(() => {
    return () => {
      cancelScheduledTriggerFocus();
    };
  }, [cancelScheduledTriggerFocus]);

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

  useEffect(() => {
    if (!isOpen) return undefined;

    const animationFrameId = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  return {
    wrapperRef,
    triggerRef,
    searchInputRef,

    isOpen,
    searchTerm,
    activeIndex,

    selectedUtente,
    filteredUtentes,
    hasResults,
    selectedLabel,

    listboxId,
    searchInputId,

    toggleDropdown,
    selectUtente,
    handleSearchChange,
    handleTriggerKeyDown,
    handleSearchKeyDown,
    setActiveIndex,
  };
}
