// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacaoCard/SantaCasaRegularizacaoCard.jsx

import styles from "./SantaCasaRegularizacaoCard.module.css";

import SantaCasaRegularizacaoDetails from "./SantaCasaRegularizacaoDetails";
import SantaCasaRegularizacaoDetailsToggle from "./SantaCasaRegularizacaoDetailsToggle";
import SantaCasaRegularizacaoHeader from "./SantaCasaRegularizacaoHeader";
import SantaCasaRegularizacaoProgress from "./SantaCasaRegularizacaoProgress";
import SantaCasaRegularizacaoSituation from "./SantaCasaRegularizacaoSituation";
import SantaCasaRegularizacaoSummary from "./SantaCasaRegularizacaoSummary";

import { getCardClassName } from "./santaCasaRegularizacaoCard.utils";
import { useSantaCasaRegularizacaoCard } from "./useSantaCasaRegularizacaoCard";

export default function SantaCasaRegularizacaoCard({
  regularizacao,
  variant = "pending",
  isGrouped = false,
}) {
  const {
    isHistory,
    isCompleted,

    eventos,
    hasEventos,

    dateLabel,
    dateValue,

    isDetailsOpen,
    toggleDetails,
  } = useSantaCasaRegularizacaoCard({
    regularizacao,
    variant,
  });

  if (!regularizacao) return null;

  const cardClassName = getCardClassName({
    styles,
    isCompleted,
    isHistory,
  });

  return (
    <article className={cardClassName}>
      <SantaCasaRegularizacaoHeader
        regularizacao={regularizacao}
        isCompleted={isCompleted}
        isGrouped={isGrouped}
        isHistory={isHistory}
        dateLabel={dateLabel}
        dateValue={dateValue}
      />

      <SantaCasaRegularizacaoSummary
        regularizacao={regularizacao}
        isCompleted={isCompleted}
        isHistory={isHistory}
      />

      {!isHistory ? (
        <SantaCasaRegularizacaoSituation
          regularizacao={regularizacao}
          isCompleted={isCompleted}
        />
      ) : null}

      {!isHistory ? (
        <SantaCasaRegularizacaoProgress regularizacao={regularizacao} />
      ) : null}

      {!isDetailsOpen && hasEventos ? (
        <SantaCasaRegularizacaoDetailsToggle
          isHistory={isHistory}
          onToggleDetails={toggleDetails}
        />
      ) : null}

      {isDetailsOpen && hasEventos ? (
        <SantaCasaRegularizacaoDetails
          eventos={eventos}
          onToggleDetails={toggleDetails}
        />
      ) : null}
    </article>
  );
}
