import {
  hasAccess,
  getRedirectPath,
} from '~/utils/authorization/client-auth-handler';
import { describe, it, expect } from 'vitest';
import { AppRole } from '~/enums/app-role';
import { AuthMap } from '~/utils/authorization/client-auth-map';
import { RoleFallbackRoutes } from '~/enums/route-fallbacks';

describe('client-auth-handler', () => {
  describe('hasAccess', () => {
    it('should return true if user has access', () => {
      const userRoles = [AppRole.Admin];
      const to = AuthMap[0].path;
      expect(hasAccess(to, userRoles)).toBe(true);
    });

    it('should return false if user does not have access', () => {
      const userRoles = [AppRole.Leader];
      const to = AuthMap[0].path;
      expect(hasAccess(to, userRoles)).toBe(false);
    });

    it('should return true if user has multiple roles and one of them has access', () => {
      const userRoles = ['User', AppRole.Admin];
      const to = AuthMap[0].path;
      expect(hasAccess(to, userRoles as AppRole[])).toBe(true);
    });

    it('should return false if user has multiple roles and none of them has access', () => {
      const userRoles = ['User', AppRole.Leader];
      const to = AuthMap[0].path;
      expect(hasAccess(to, userRoles as AppRole[])).toBe(false);
    });
  });

  describe('getRedirectPath', () => {
    it('should return admin route if user is an Admin, Finance Manager, or Operations Manager', () => {
      const userRoles = [AppRole.Admin];
      expect(getRedirectPath(userRoles)).toBe(RoleFallbackRoutes.AdminRoot);
    });

    it('should return leader route if user is a Leader', () => {
      const userRoles = [AppRole.Leader];
      expect(getRedirectPath(userRoles)).toBe(RoleFallbackRoutes.LeaderRoot);
    });

    it('should return Unauthorized if user does not have a specific role', () => {
      const userRoles = ['User'];
      expect(getRedirectPath(userRoles as AppRole[])).toBe(
        RoleFallbackRoutes.Unauthorized
      );
    });

    it('should return admin route if user has multiple roles including Admin', () => {
      const userRoles = [AppRole.OperationsManager, AppRole.Admin];
      expect(getRedirectPath(userRoles)).toBe(RoleFallbackRoutes.AdminRoot);
    });
  });
});
