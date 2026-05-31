// src/features/santacasa/operacao/components/OperacaoDraftNotice/OperacaoDraftNotice.jsx
import { Link } from "react-router-dom";

import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { OPERACAO_PAGE } from "../../config/operacaoPage.config";

import styles from "./OperacaoDraftNotice.module.css";

export default function OperacaoDraftNotice({ pedidoDraftCount = 0 }) {
  return (
    <SurfaceCard
      eyebrow={OPERACAO_PAGE.draft.eyebrow}
      title={OPERACAO_PAGE.draft.title}
      description={OPERACAO_PAGE.draft.description}
      tone="gold"
    >
      <div className={styles.notice}>
        <p>{OPERACAO_PAGE.draft.buildNotice(pedidoDraftCount)}</p>

        <Link to="/santacasa/pedidos" className={styles.link}>
          {OPERACAO_PAGE.draft.linkLabel}
        </Link>
      </div>
    </SurfaceCard>
  );
}
