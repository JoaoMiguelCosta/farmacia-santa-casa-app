// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacaoCard/SantaCasaRegularizacaoEvent.jsx

import BarcodeValue from "../../../../../shared/ui/BarcodeValue/BarcodeValue";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import {
  getEventoCreatedAtLabel,
  getEventoQuantidadeLabel,
  getEventoReceitaLinhaLabel,
  getEventoReceitaValidadeLabel,
} from "../../utils/santaCasaRegularizacoes.utils";

import SantaCasaRegularizacaoUnitValue from "./SantaCasaRegularizacaoUnitValue";

import { getEventoReceita } from "./santaCasaRegularizacaoCard.utils";

import styles from "./SantaCasaRegularizacaoEvent.module.css";

function ReceitaCodeValue({ label, value, width }) {
  return (
    <div className={styles.eventCodeValue}>
      <BarcodeValue
        size="compact"
        label={label}
        value={value}
        caption={value}
        height={24}
        width={width}
        displayValue={false}
      />
    </div>
  );
}

export default function SantaCasaRegularizacaoEvent({ evento }) {
  const receita = getEventoReceita(evento);

  return (
    <li className={styles.event}>
      <div className={styles.eventHeader}>
        <span className={styles.eventEyebrow}>
          {SANTACASA_REGULARIZACOES_PAGE.labels.evento}
        </span>

        <strong className={styles.eventTitle}>
          {getEventoReceitaLinhaLabel(evento)}
        </strong>
      </div>

      <dl className={styles.eventDataList}>
        <div className={styles.eventMetaHighlight}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.quantidade}</dt>
          <dd>
            <SantaCasaRegularizacaoUnitValue
              value={getEventoQuantidadeLabel(evento)}
              tone="success"
            />
          </dd>
        </div>

        <div>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.validade}</dt>
          <dd>{getEventoReceitaValidadeLabel(evento)}</dd>
        </div>

        <div>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.createdAt}</dt>
          <dd>{getEventoCreatedAtLabel(evento)}</dd>
        </div>

        <div className={styles.eventCodeCell}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.receitaNumber}</dt>
          <dd>
            <ReceitaCodeValue
              label={SANTACASA_REGULARIZACOES_PAGE.labels.receitaNumber}
              value={receita?.numero19}
              width={0.58}
            />
          </dd>
        </div>

        <div className={styles.eventCodeCell}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.pinAcesso}</dt>
          <dd>
            <ReceitaCodeValue
              label={SANTACASA_REGULARIZACOES_PAGE.labels.pinAcesso}
              value={receita?.pinAcesso6}
              width={0.92}
            />
          </dd>
        </div>

        <div className={styles.eventCodeCell}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.pinOpcao}</dt>
          <dd>
            <ReceitaCodeValue
              label={SANTACASA_REGULARIZACOES_PAGE.labels.pinOpcao}
              value={receita?.pinOpcao4}
              width={1.02}
            />
          </dd>
        </div>
      </dl>
    </li>
  );
}
