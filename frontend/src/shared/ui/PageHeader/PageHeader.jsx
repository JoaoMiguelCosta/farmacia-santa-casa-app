import { classNames } from "../../utils/classNames";

import styles from "./PageHeader.module.css";

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions = null,
  align = "left",
  titleId,
}) {
  const alignClassName = styles[align] || "";

  return (
    <header className={classNames(styles.header, alignClassName)}>
      <div className={styles.content}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}

        <h1 id={titleId} className={styles.title}>
          {title}
        </h1>

        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>

      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
