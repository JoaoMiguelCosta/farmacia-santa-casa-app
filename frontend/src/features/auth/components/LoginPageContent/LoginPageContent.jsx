import { Navigate } from "react-router-dom";

import { LOGIN_PAGE_CONFIG } from "../../config/loginPage.config";
import { useLoginPage } from "../../hooks/useLoginPage";

import styles from "./LoginPageContent.module.css";

export default function LoginPageContent() {
  const {
    email,
    password,

    emailInputRef,
    passwordInputRef,

    user,
    isAuthenticated,
    isLoadingSession,
    isLoggingIn,
    isPasswordVisible,

    invalidFields,
    redirectPath,

    authFeedback,
    hasAuthFeedback,
    authFeedbackIsNotice,
    localError,

    handleEmailChange,
    handlePasswordChange,
    handlePasswordVisibilityToggle,
    handleSubmit,
  } = useLoginPage();

  if (isLoadingSession) {
    return (
      <section className={styles.page}>
        <div
          className={`${styles.card} ${styles.loadingCard}`}
          role="status"
          aria-live="polite"
        >
          <span className={styles.loadingIndicator} aria-hidden="true" />

          <p className={styles.loading}>
            {LOGIN_PAGE_CONFIG.feedback.loadingSession}
          </p>
        </div>
      </section>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={redirectPath} replace />;
  }

  const passwordVisibilityLabel = isPasswordVisible
    ? LOGIN_PAGE_CONFIG.actions.hidePassword
    : LOGIN_PAGE_CONFIG.actions.showPassword;

  const passwordVisibilityText = isPasswordVisible
    ? LOGIN_PAGE_CONFIG.actions.hidePasswordShort
    : LOGIN_PAGE_CONFIG.actions.showPasswordShort;

  return (
    <section
      className={styles.page}
      aria-labelledby={LOGIN_PAGE_CONFIG.aria.titleId}
    >
      <div className={styles.card}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>{LOGIN_PAGE_CONFIG.header.eyebrow}</p>

          <h1 id={LOGIN_PAGE_CONFIG.aria.titleId} className={styles.title}>
            {LOGIN_PAGE_CONFIG.header.title}
          </h1>

          <p className={styles.description}>
            {LOGIN_PAGE_CONFIG.header.description}
          </p>
        </header>

        <form className={styles.form} noValidate onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label
              className={styles.label}
              htmlFor={LOGIN_PAGE_CONFIG.aria.emailId}
            >
              {LOGIN_PAGE_CONFIG.fields.email.label}
            </label>

            <input
              ref={emailInputRef}
              id={LOGIN_PAGE_CONFIG.aria.emailId}
              className={styles.input}
              type="email"
              inputMode="email"
              value={email}
              placeholder={LOGIN_PAGE_CONFIG.fields.email.placeholder}
              autoComplete={LOGIN_PAGE_CONFIG.fields.email.autoComplete}
              disabled={isLoggingIn}
              aria-invalid={invalidFields.email}
              aria-describedby={
                invalidFields.email && localError
                  ? LOGIN_PAGE_CONFIG.aria.localErrorId
                  : undefined
              }
              onChange={handleEmailChange}
            />
          </div>

          <div className={styles.field}>
            <label
              className={styles.label}
              htmlFor={LOGIN_PAGE_CONFIG.aria.passwordId}
            >
              {LOGIN_PAGE_CONFIG.fields.password.label}
            </label>

            <div className={styles.passwordControl}>
              <input
                ref={passwordInputRef}
                id={LOGIN_PAGE_CONFIG.aria.passwordId}
                className={`${styles.input} ${styles.passwordInput}`}
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                placeholder={LOGIN_PAGE_CONFIG.fields.password.placeholder}
                autoComplete={LOGIN_PAGE_CONFIG.fields.password.autoComplete}
                disabled={isLoggingIn}
                aria-invalid={invalidFields.password}
                aria-describedby={
                  invalidFields.password && localError
                    ? LOGIN_PAGE_CONFIG.aria.localErrorId
                    : undefined
                }
                onChange={handlePasswordChange}
              />

              <button
                type="button"
                className={styles.passwordToggle}
                disabled={isLoggingIn}
                aria-label={passwordVisibilityLabel}
                aria-pressed={isPasswordVisible}
                title={passwordVisibilityLabel}
                onClick={handlePasswordVisibilityToggle}
              >
                {passwordVisibilityText}
              </button>
            </div>
          </div>

          {hasAuthFeedback ? (
            <p
              id={LOGIN_PAGE_CONFIG.aria.authFeedbackId}
              className={authFeedbackIsNotice ? styles.notice : styles.error}
              role={authFeedbackIsNotice ? "status" : "alert"}
            >
              {authFeedback}
            </p>
          ) : null}

          {localError ? (
            <p
              id={LOGIN_PAGE_CONFIG.aria.localErrorId}
              className={styles.error}
              role="alert"
            >
              {localError}
            </p>
          ) : null}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoggingIn}
          >
            {isLoggingIn
              ? LOGIN_PAGE_CONFIG.actions.submitting
              : LOGIN_PAGE_CONFIG.actions.submit}
          </button>
        </form>

        <p className={styles.footerNote}>{LOGIN_PAGE_CONFIG.footer.note}</p>
      </div>
    </section>
  );
}
