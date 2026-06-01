// src/features/santacasa/shared/components/UtenteCombobox/UtenteCombobox.jsx
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./UtenteCombobox.module.css";

function normalizeSearchValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function getUtenteLabel(utente) {
  if (!utente) return "";

  return `${utente.nome} — ${utente.numero9}`;
}

function getUtenteSearchValue(utente) {
  return normalizeSearchValue(`${utente.nome} ${utente.numero9}`);
}

function getFilteredUtentes(utentes, searchTerm) {
  const normalizedSearch = normalizeSearchValue(searchTerm);

  if (!normalizedSearch) {
    return utentes;
  }

  return utentes.filter((utente) => {
    return getUtenteSearchValue(utente).includes(normalizedSearch);
  });
}

function getInitialActiveIndex(total) {
  return total > 0 ? 0 : -1;
}

function getActiveIndexAfterMove({ currentIndex, direction, total }) {
  if (total <= 0) return -1;

  if (currentIndex < 0) {
    return direction > 0 ? 0 : total - 1;
  }

  return (currentIndex + direction + total) % total;
}

export default function UtenteCombobox({
  id,
  utentes = [],
  value = "",
  onChange,
  disabled = false,
  placeholder = "Seleciona um utente",
  searchPlaceholder = "Pesquisar...",
  noResultsLabel = "Nenhum resultado encontrado.",
}) {
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);

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

  function closeDropdown() {
    setIsOpen(false);
    setSearchTerm("");
    setActiveIndex(-1);
  }

  function openDropdown() {
    if (disabled) return;

    setIsOpen(true);
    setActiveIndex(getInitialActiveIndex(filteredUtentes.length));
  }

  function toggleDropdown() {
    if (disabled) return;

    const nextIsOpen = !isOpen;

    setIsOpen(nextIsOpen);

    if (nextIsOpen) {
      setActiveIndex(getInitialActiveIndex(filteredUtentes.length));
    }
  }

  function selectUtente(utente) {
    onChange?.(utente.id);
    closeDropdown();

    window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }

  function handleSearchChange(event) {
    const nextSearchTerm = event.target.value;
    const nextFilteredUtentes = getFilteredUtentes(utentes, nextSearchTerm);

    setSearchTerm(nextSearchTerm);

    if (nextFilteredUtentes.length !== filteredUtentes.length) {
      setActiveIndex(getInitialActiveIndex(nextFilteredUtentes.length));
    }
  }

  function handleTriggerKeyDown(event) {
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
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown();

      window.requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });

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
  }

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
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className={styles.combobox}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={styles.trigger}
        onClick={toggleDropdown}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
      >
        <span
          className={
            selectedUtente ? styles.triggerValue : styles.triggerPlaceholder
          }
        >
          {selectedLabel}
        </span>

        <span className={styles.triggerIcon} aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className={styles.dropdown}>
          <div className={styles.searchWrap}>
            <input
              ref={searchInputRef}
              id={searchInputId}
              type="search"
              className={styles.searchInput}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              autoComplete="off"
            />
          </div>

          <div id={listboxId} className={styles.options} role="listbox">
            {hasResults ? (
              filteredUtentes.map((utente, index) => {
                const isSelected = utente.id === value;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={utente.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={[
                      styles.option,
                      isSelected ? styles.selected : "",
                      isActive ? styles.active : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectUtente(utente)}
                  >
                    <span className={styles.optionName}>{utente.nome}</span>
                    <span className={styles.optionNumber}>
                      N.º utente {utente.numero9}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className={styles.empty}>{noResultsLabel}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
