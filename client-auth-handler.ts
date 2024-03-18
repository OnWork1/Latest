import { RoleFallbackRoutes } from '~/enums/route-fallbacks';
import { AppRole } from '~/enums/app-role';
import { AuthMap } from './client-auth-map';

export function hasAccess(to: string, userRoles: AppRole[]): boolean {
  const path = AuthMap.find(
    (x) => x.path.toLowerCase().trim() === to.toLowerCase()
  );
  if (path) {
    if (path.roles.some((role) => userRoles.includes(role))) {
      return true;
    }
  }
  return false;
}

export function getRedirectPath(userRoles: AppRole[]): string {
  if (
    userRoles.includes(AppRole.Admin) ||
    userRoles.includes(AppRole.FinanceManager) ||
    userRoles.includes(AppRole.OperationsManager)
  ) {
    return RoleFallbackRoutes.AdminRoot;
  } else if (userRoles.includes(AppRole.Leader)) {
    return RoleFallbackRoutes.LeaderRoot;
  } else {
    return RoleFallbackRoutes.Unauthorized;
  }
}
