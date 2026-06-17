import ConfirmDialog from "../../../../../shared/ui/ConfirmDialog/ConfirmDialog";

import { SYSTEM_USERS_PAGE } from "../../config/systemUsersPage.config";

function getStatusTitle(user) {
  if (!user) return "";

  const action = user.isActive
    ? SYSTEM_USERS_PAGE.actions.deactivate
    : SYSTEM_USERS_PAGE.actions.activate;

  return SYSTEM_USERS_PAGE.confirm.status.getTitleLabel(action);
}

function getStatusDescription(user) {
  if (!user) return "";

  return user.isActive
    ? SYSTEM_USERS_PAGE.confirm.status.inactivateDescription
    : SYSTEM_USERS_PAGE.confirm.status.activateDescription;
}

function getStatusConfirmLabel(user) {
  if (!user) return "";

  return user.isActive
    ? SYSTEM_USERS_PAGE.actions.deactivate
    : SYSTEM_USERS_PAGE.actions.activate;
}

export default function SystemUsersDialogs({
  pendingStatusUser,
  pendingDeleteUser,
  statusChangingUserId,
  deletingUserId,
  onConfirmStatus,
  onCancelStatus,
  onConfirmDelete,
  onCancelDelete,
}) {
  return (
    <>
      <ConfirmDialog
        isOpen={Boolean(pendingStatusUser)}
        title={getStatusTitle(pendingStatusUser)}
        description={getStatusDescription(pendingStatusUser)}
        confirmLabel={getStatusConfirmLabel(pendingStatusUser)}
        cancelLabel={SYSTEM_USERS_PAGE.actions.cancel}
        isLoading={Boolean(statusChangingUserId)}
        onConfirm={onConfirmStatus}
        onCancel={onCancelStatus}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteUser)}
        title={SYSTEM_USERS_PAGE.confirm.delete.title}
        description={SYSTEM_USERS_PAGE.confirm.delete.description}
        confirmLabel={SYSTEM_USERS_PAGE.actions.remove}
        cancelLabel={SYSTEM_USERS_PAGE.actions.cancel}
        isLoading={Boolean(deletingUserId)}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </>
  );
}
