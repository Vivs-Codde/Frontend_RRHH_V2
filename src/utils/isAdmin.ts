import { getUserPermissions } from "../utils/permissions";

export function isAdmin() {
  // Si el usuario tiene '*' en permisos, es admin
  const perms = getUserPermissions();
  return perms.includes("*");
}
