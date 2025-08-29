// src/utils/permissions.ts
export function getUserPermissions(): string[] {
  const perms = localStorage.getItem("userPermissions");
  return perms ? JSON.parse(perms) : [];
}

export function hasPermission(permission: string): boolean {
  const perms = getUserPermissions();
  // Si el usuario tiene '*', es admin y tiene acceso total
  if (perms.includes("*")) return true;
  return perms.includes(permission);
}
