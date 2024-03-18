import { AppRole } from '~/enums/app-role';
import { RoleFallbackRoutes } from '~/enums/route-fallbacks';
import {
  getRedirectPath,
  hasAccess,
} from '~/utils/authorization/client-auth-handler';

export default defineNuxtRouteMiddleware((to) => {
  if (to.path === RoleFallbackRoutes.Unauthorized) return;
  const { data } = useAuth();
  const user = data.value?.user;
  if (user) {
    const isAuthorized = hasAccess(to.path, user.roles as AppRole[]);
    if (!isAuthorized) {
      const redirectTo = getRedirectPath(user.roles as AppRole[]);
      return navigateTo(redirectTo);
    }
  }
});
