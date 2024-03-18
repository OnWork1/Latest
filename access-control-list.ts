import { AppRole } from '~/enums/app-role';

const CRUD = ['create', 'read', 'update', 'delete'];
const CRU = ['create', 'read', 'update'];

export const AccessControlList = {
  users: {
    [AppRole.FinanceManager]: CRU,
  },
  products: {
    [AppRole.FinanceManager]: CRU,
  },
  accounts: {
    [AppRole.FinanceManager]: CRUD,
    [AppRole.OperationsManager]: CRUD,
  },
  'budget-lines': {
    [AppRole.FinanceManager]: CRU,
  },
};

export const hasPermission = (
  route: string,
  roles: string[],
  action: string = 'read'
): boolean => {
  if (roles.length === 1 && roles.includes(AppRole.Leader)) {
    return false;
  }

  if (roles.includes(AppRole.Admin)) {
    return true;
  }

  // check if the role has the necessary permissions for the action on the route
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routePermissions = (AccessControlList as any)[route] || {};
  const rolePermissions = roles.flatMap((r) => routePermissions[r] || []);

  // use Set to remove duplicate permissions
  const permissions = [...new Set(rolePermissions)];

  // check if the action is allowed for the role on the route
  return permissions.includes(action);
};
