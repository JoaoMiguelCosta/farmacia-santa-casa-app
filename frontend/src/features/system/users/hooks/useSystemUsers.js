import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import {
  createSystemUser,
  deleteSystemUser,
  getSystemUsers,
  updateSystemUser,
  updateSystemUserPassword,
  updateSystemUserStatus,
} from "../api/systemUsersApi";

import { SYSTEM_USERS_PAGE } from "../config/systemUsersPage.config";

import {
  SYSTEM_USERS_DEFAULT_FILTERS,
  SYSTEM_USERS_DEFAULT_FORM,
  buildCreateSystemUserPayload,
  buildSystemUserFormFromUser,
  buildSystemUsersQuery,
  buildUpdateSystemUserPasswordPayload,
  buildUpdateSystemUserPayload,
  buildUpdateSystemUserStatusPayload,
  canToggleSystemUserStatus,
  getSystemUsersErrorMessage,
  normalizeSystemUsersResponse,
  validateCreateSystemUserForm,
  validatePasswordForm,
  validateUpdateSystemUserForm,
} from "../utils/systemUsers.utils";

const FORM_MODES = Object.freeze({
  CREATE: "create",
  EDIT: "edit",
  PASSWORD: "password",
});

function getInitialFormState() {
  return {
    mode: null,
    selectedUser: null,
    values: {
      ...SYSTEM_USERS_DEFAULT_FORM,
    },
  };
}

export function useSystemUsers() {
  const { user: currentUser, handleAuthError } = useAuth();

  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    skip: 0,
    take: 0,
  });

  const [filters, setFilters] = useState({
    ...SYSTEM_USERS_DEFAULT_FILTERS,
  });

  const [formState, setFormState] = useState(getInitialFormState);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusChangingUserId, setStatusChangingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const hasUsers = users.length > 0;
  const isFormOpen = Boolean(formState.mode);
  const isBusy =
    isSubmitting || Boolean(statusChangingUserId) || Boolean(deletingUserId);

  const isCreateMode = formState.mode === FORM_MODES.CREATE;
  const isEditMode = formState.mode === FORM_MODES.EDIT;
  const isPasswordMode = formState.mode === FORM_MODES.PASSWORD;

  const query = useMemo(() => buildSystemUsersQuery(filters), [filters]);

  const loadUsers = useCallback(
    async ({ showRefreshing = false } = {}) => {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const response = await getSystemUsers(query);
        const normalized = normalizeSystemUsersResponse(response);

        setUsers(normalized.users);
        setMeta(normalized.meta);
      } catch (loadError) {
        if (handleAuthError(loadError)) return;

        setError(getSystemUsersErrorMessage(loadError));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [handleAuthError, query],
  );

  const refreshUsers = useCallback(async () => {
    await loadUsers({ showRefreshing: true });
  }, [loadUsers]);

  const updateFilter = useCallback((name, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      ...SYSTEM_USERS_DEFAULT_FILTERS,
    });
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const openCreateForm = useCallback(() => {
    setFeedback(null);
    setFormState({
      mode: FORM_MODES.CREATE,
      selectedUser: null,
      values: {
        ...SYSTEM_USERS_DEFAULT_FORM,
      },
    });
  }, []);

  const openEditForm = useCallback((selectedUser) => {
    setFeedback(null);
    setFormState({
      mode: FORM_MODES.EDIT,
      selectedUser,
      values: buildSystemUserFormFromUser(selectedUser),
    });
  }, []);

  const openPasswordForm = useCallback((selectedUser) => {
    setFeedback(null);
    setFormState({
      mode: FORM_MODES.PASSWORD,
      selectedUser,
      values: {
        ...buildSystemUserFormFromUser(selectedUser),
        password: "",
      },
    });
  }, []);

  const closeForm = useCallback(() => {
    setFormState(getInitialFormState());
  }, []);

  const updateFormValue = useCallback((name, value) => {
    setFormState((currentState) => ({
      ...currentState,
      values: {
        ...currentState.values,
        [name]: value,
      },
    }));
  }, []);

  const submitCreateUser = useCallback(async () => {
    const validationError = validateCreateSystemUserForm(formState.values);

    if (validationError) {
      setFeedback({
        type: "error",
        message: validationError,
      });

      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const payload = buildCreateSystemUserPayload(formState.values);

      await createSystemUser(payload);

      setFeedback({
        type: "success",
        message: SYSTEM_USERS_PAGE.feedback.createSuccess,
      });

      closeForm();
      await loadUsers({ showRefreshing: true });
    } catch (submitError) {
      if (handleAuthError(submitError)) return;

      setFeedback({
        type: "error",
        message: getSystemUsersErrorMessage(submitError),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [closeForm, formState.values, handleAuthError, loadUsers]);

  const submitUpdateUser = useCallback(async () => {
    const selectedUserId = formState.selectedUser?.id;

    if (!selectedUserId) {
      setFeedback({
        type: "error",
        message: "Utilizador inválido.",
      });

      return;
    }

    const validationError = validateUpdateSystemUserForm(formState.values);

    if (validationError) {
      setFeedback({
        type: "error",
        message: validationError,
      });

      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const payload = buildUpdateSystemUserPayload(formState.values);

      await updateSystemUser(selectedUserId, payload);

      setFeedback({
        type: "success",
        message: SYSTEM_USERS_PAGE.feedback.updateSuccess,
      });

      closeForm();
      await loadUsers({ showRefreshing: true });
    } catch (submitError) {
      if (handleAuthError(submitError)) return;

      setFeedback({
        type: "error",
        message: getSystemUsersErrorMessage(submitError),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    closeForm,
    formState.selectedUser?.id,
    formState.values,
    handleAuthError,
    loadUsers,
  ]);

  const submitPasswordChange = useCallback(async () => {
    const selectedUserId = formState.selectedUser?.id;

    if (!selectedUserId) {
      setFeedback({
        type: "error",
        message: "Utilizador inválido.",
      });

      return;
    }

    const validationError = validatePasswordForm(formState.values);

    if (validationError) {
      setFeedback({
        type: "error",
        message: validationError,
      });

      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const payload = buildUpdateSystemUserPasswordPayload(formState.values);

      await updateSystemUserPassword(selectedUserId, payload);

      setFeedback({
        type: "success",
        message: SYSTEM_USERS_PAGE.feedback.passwordSuccess,
      });

      closeForm();
    } catch (submitError) {
      if (handleAuthError(submitError)) return;

      setFeedback({
        type: "error",
        message: getSystemUsersErrorMessage(submitError),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    closeForm,
    formState.selectedUser?.id,
    formState.values,
    handleAuthError,
  ]);

  const submitForm = useCallback(async () => {
    if (isCreateMode) {
      await submitCreateUser();
      return;
    }

    if (isEditMode) {
      await submitUpdateUser();
      return;
    }

    if (isPasswordMode) {
      await submitPasswordChange();
    }
  }, [
    isCreateMode,
    isEditMode,
    isPasswordMode,
    submitCreateUser,
    submitPasswordChange,
    submitUpdateUser,
  ]);

  const toggleUserStatus = useCallback(
    async (targetUser) => {
      if (!canToggleSystemUserStatus(targetUser, currentUser)) {
        setFeedback({
          type: "error",
          message: SYSTEM_USERS_PAGE.feedback.selfDeactivateBlocked,
        });

        return;
      }

      const nextIsActive = !targetUser.isActive;

      setStatusChangingUserId(targetUser.id);
      setFeedback(null);

      try {
        const payload = buildUpdateSystemUserStatusPayload(nextIsActive);

        await updateSystemUserStatus(targetUser.id, payload);

        setFeedback({
          type: "success",
          message: SYSTEM_USERS_PAGE.feedback.statusSuccess,
        });

        await loadUsers({ showRefreshing: true });
      } catch (statusError) {
        if (handleAuthError(statusError)) return;

        setFeedback({
          type: "error",
          message: getSystemUsersErrorMessage(statusError),
        });
      } finally {
        setStatusChangingUserId(null);
      }
    },
    [currentUser, handleAuthError, loadUsers],
  );

  const deleteUser = useCallback(
    async (targetUser) => {
      if (!targetUser?.id) {
        setFeedback({
          type: "error",
          message: "Utilizador inválido.",
        });

        return;
      }

      if (targetUser.id === currentUser?.id) {
        setFeedback({
          type: "error",
          message: SYSTEM_USERS_PAGE.feedback.selfDeleteBlocked,
        });

        return;
      }

      if (targetUser.isActive) {
        setFeedback({
          type: "error",
          message: SYSTEM_USERS_PAGE.feedback.deleteActiveBlocked,
        });

        return;
      }

      setDeletingUserId(targetUser.id);
      setFeedback(null);

      try {
        await deleteSystemUser(targetUser.id);

        setFeedback({
          type: "success",
          message: SYSTEM_USERS_PAGE.feedback.deleteSuccess,
        });

        await loadUsers({ showRefreshing: true });
      } catch (deleteError) {
        if (handleAuthError(deleteError)) return;

        setFeedback({
          type: "error",
          message: getSystemUsersErrorMessage(deleteError),
        });
      } finally {
        setDeletingUserId(null);
      }
    },
    [currentUser?.id, handleAuthError, loadUsers],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadInitialUsers() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getSystemUsers(query);
        const normalized = normalizeSystemUsersResponse(response);

        if (!isMounted) return;

        setUsers(normalized.users);
        setMeta(normalized.meta);
      } catch (loadError) {
        if (!isMounted) return;
        if (handleAuthError(loadError)) return;

        setError(getSystemUsersErrorMessage(loadError));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialUsers();

    return () => {
      isMounted = false;
    };
  }, [handleAuthError, query]);

  return {
    users,
    meta,
    hasUsers,

    filters,
    query,

    formState,
    isFormOpen,
    isCreateMode,
    isEditMode,
    isPasswordMode,

    isLoading,
    isRefreshing,
    isSubmitting,
    isBusy,
    statusChangingUserId,
    deletingUserId,

    error,
    feedback,

    currentUser,

    loadUsers,
    refreshUsers,

    updateFilter,
    clearFilters,

    openCreateForm,
    openEditForm,
    openPasswordForm,
    closeForm,
    updateFormValue,
    submitForm,

    toggleUserStatus,
    deleteUser,

    clearFeedback,
  };
}
