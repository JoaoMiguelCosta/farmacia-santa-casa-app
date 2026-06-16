import RequireAuth from "../../features/auth/components/RequireAuth";
import RequireRole from "../../features/auth/components/RequireRole";

export function protectedElement(element, allowedRoles) {
  return (
    <RequireAuth>
      <RequireRole allowedRoles={allowedRoles}>{element}</RequireRole>
    </RequireAuth>
  );
}
