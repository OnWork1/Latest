import { AppRole } from '~/enums/app-role';
import { describe, it, expect } from 'vitest';
import { AuthMap } from '~/utils/authorization/client-auth-map';

describe('AuthMap', () => {
  it('should have correct paths and roles', () => {
    const expectedAuthMap = [
      { path: '/', roles: [AppRole.Admin] },
      {
        path: '/admin/dashboard',
        roles: [
          AppRole.Admin,
          AppRole.FinanceManager,
          AppRole.OperationsManager,
        ],
      },
      {
        path: '/admin/accounts',
        roles: [
          AppRole.Admin,
          AppRole.FinanceManager,
          AppRole.OperationsManager,
        ],
      },
      { path: '/admin/brands', roles: [AppRole.Admin] },
      { path: '/admin/businesses', roles: [AppRole.Admin] },
      { path: '/admin/budget', roles: [AppRole.Admin, AppRole.FinanceManager] },
      {
        path: '/admin/budget-lines',
        roles: [AppRole.Admin, AppRole.FinanceManager],
      },
      { path: '/admin/companies', roles: [AppRole.Admin] },
      { path: '/admin/currencies', roles: [AppRole.Admin] },
      { path: '/admin/departments', roles: [AppRole.Admin] },
      { path: '/admin/expense-categories', roles: [AppRole.Admin] },
      {
        path: '/admin/products',
        roles: [AppRole.Admin, AppRole.FinanceManager],
      },
      { path: '/admin/taxes', roles: [AppRole.Admin] },
      { path: '/admin/sales-tax-groups', roles: [AppRole.Admin] },
      { path: '/admin/users', roles: [AppRole.Admin, AppRole.FinanceManager] },
      { path: '/leader/accounts', roles: [AppRole.Admin, AppRole.Leader] },
      {
        path: '/leader/accounts/details',
        roles: [AppRole.Admin, AppRole.Leader],
      },
      { path: '/leader/expenses', roles: [AppRole.Admin, AppRole.Leader] },
      {
        path: '/leader/expenses/details',
        roles: [AppRole.Admin, AppRole.Leader],
      },
      {
        path: '/leader/expenses/receipts',
        roles: [AppRole.Admin, AppRole.Leader],
      },
    ];

    expect(AuthMap).toEqual(expectedAuthMap);
  });

  it('should contain only valid roles', () => {
    AuthMap.forEach((route) => {
      route.roles.forEach((role) => {
        expect(Object.values(AppRole)).toContain(role);
      });
    });
  });

  it('should not contain duplicate paths', () => {
    const paths = AuthMap.map((route) => route.path);
    const uniquePaths = [...new Set(paths)];

    expect(paths.length).toBe(uniquePaths.length);
  });

  it('should not contain duplicate roles for a path', () => {
    AuthMap.forEach((route) => {
      const uniqueRoles = [...new Set(route.roles)];
      expect(route.roles.length).toBe(uniqueRoles.length);
    });
  });

  it('should not contain paths without roles', () => {
    AuthMap.forEach((route) => {
      expect(route.roles.length).toBeGreaterThan(0);
    });
  });
});
