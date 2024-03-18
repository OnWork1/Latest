import { AppRole } from '~/enums/app-role';
import { describe, it, expect } from 'vitest';
import { hasPermission } from '~/utils/access-control-list';

describe('hasPermission', () => {
  it('should return false if the only role is Leader', () => {
    expect(hasPermission('users', [AppRole.Leader], 'read')).toBe(false);
  });

  it('should return true if one of the roles is Admin', () => {
    expect(hasPermission('users', [AppRole.Admin], 'read')).toBe(true);
  });

  it('should return true if the FinanceManager role has permission to create users', () => {
    expect(hasPermission('users', [AppRole.FinanceManager], 'create')).toBe(
      true
    );
  });

  it('should return false if the FinanceManager role does not have permission to delete users', () => {
    expect(hasPermission('users', [AppRole.FinanceManager], 'delete')).toBe(
      false
    );
  });

  it('should return true if the OperationsManager role has permission to delete accounts', () => {
    expect(
      hasPermission('accounts', [AppRole.OperationsManager], 'delete')
    ).toBe(true);
  });

  it('should return false if the route does not exist in the AccessControlList', () => {
    expect(
      hasPermission('nonexistentRoute', [AppRole.FinanceManager], 'read')
    ).toBe(false);
  });

  it('should return true if one of the user roles has the required permission', () => {
    expect(
      hasPermission(
        'accounts',
        [AppRole.FinanceManager, AppRole.OperationsManager],
        'delete'
      )
    ).toBe(true);
  });
});
