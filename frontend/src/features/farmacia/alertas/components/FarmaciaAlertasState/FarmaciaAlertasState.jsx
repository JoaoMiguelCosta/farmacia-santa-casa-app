import styles from "./FarmaciaAlertasState.module.css";

export default function FarmaciaAlertasState({
  children,
  tone = "notice",
  role,
}) {
  const className = [styles.state, styles[tone]].filter(Boolean).join(" ");

  return (
    <p className={className} role={role}>
      {children}
    </p>
  );
}
