import { classNames } from "../../../../../shared/utils/classNames";

import styles from "./FarmaciaAlertasState.module.css";

export default function FarmaciaAlertasState({
  children,
  tone = "notice",
  role,
}) {
  const className = classNames(styles.state, styles[tone]);

  return (
    <p className={className} role={role}>
      {children}
    </p>
  );
}
