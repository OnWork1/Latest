import { AppRole } from '~/enums/app-role';

interface ClientRouteAuthorization {
  path: string;
  roles: AppRole[];
}

export const AuthMap: ClientRouteAuthorization[] = [
  { path: '/', roles: [AppRole.Admin] },
  {
    path: '/admin/dashboard',
    roles: [AppRole.Admin, AppRole.FinanceManager, AppRole.OperationsManager],
  },
  {
    path: '/admin/accounts',
    roles: [AppRole.Admin, AppRole.FinanceManager, AppRole.OperationsManager],
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
  { path: '/admin/products', roles: [AppRole.Admin, AppRole.FinanceManager] },
  { path: '/admin/taxes', roles: [AppRole.Admin] },
  { path: '/admin/sales-tax-groups', roles: [AppRole.Admin] },
  { path: '/admin/users', roles: [AppRole.Admin, AppRole.FinanceManager] },

  { path: '/leader/accounts', roles: [AppRole.Admin, AppRole.Leader] },
  { path: '/leader/accounts/details', roles: [AppRole.Admin, AppRole.Leader] },
  { path: '/leader/expenses', roles: [AppRole.Admin, AppRole.Leader] },
  { path: '/leader/expenses/details', roles: [AppRole.Admin, AppRole.Leader] },
  { path: '/leader/expenses/receipts', roles: [AppRole.Admin, AppRole.Leader] },
];
