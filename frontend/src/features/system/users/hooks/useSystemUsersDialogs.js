import { useState } from "react";

export function useSystemUsersDialogs({ toggleUserStatus, deleteUser }) {
  const [pendingStatusUser, setPendingStatusUser] = useState(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);

  function handleRequestToggleStatus(user) {
    setPendingDeleteUser(null);
    setPendingStatusUser(user);
  }

  function handleCancelToggleStatus() {
    setPendingStatusUser(null);
  }

  async function handleConfirmToggleStatus() {
    if (!pendingStatusUser) return;

    await toggleUserStatus(pendingStatusUser);
    setPendingStatusUser(null);
  }

  function handleRequestDelete(user) {
    setPendingStatusUser(null);
    setPendingDeleteUser(user);
  }

  function handleCancelDelete() {
    setPendingDeleteUser(null);
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteUser) return;

    await deleteUser(pendingDeleteUser);
    setPendingDeleteUser(null);
  }

  return {
    pendingStatusUser,
    pendingDeleteUser,
    handleRequestToggleStatus,
    handleCancelToggleStatus,
    handleConfirmToggleStatus,
    handleRequestDelete,
    handleCancelDelete,
    handleConfirmDelete,
  };
}
