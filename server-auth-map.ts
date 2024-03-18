import { AppRole } from '~/enums/app-role';

export type HTTPMethod = 'GET' | 'PATCH' | 'POST' | 'PUT' | 'DELETE';

interface Privileges {
  httpMethod: HTTPMethod;
  roles: AppRole[];
}

interface ServerRouteAuthorization {
  namespace: string;
  privileges: Privileges[];
}

export const AuthMap: ServerRouteAuthorization[] = [
  {
    namespace: 'brands',
    privileges: [
      { httpMethod: 'GET', roles: [AppRole.Admin, AppRole.FinanceManager] },
      { httpMethod: 'DELETE', roles: [AppRole.Admin] },
      { httpMethod: 'PATCH', roles: [AppRole.Admin] },
      { httpMethod: 'POST', roles: [AppRole.Admin] },
    ],
  },

  {
    namespace: 'departments',
    privileges: [
      {
        httpMethod: 'GET',
        roles: [AppRole.Admin, AppRole.Leader, AppRole.FinanceManager],
      },
      { httpMethod: 'DELETE', roles: [AppRole.Admin] },
      { httpMethod: 'PATCH', roles: [AppRole.Admin] },
      { httpMethod: 'POST', roles: [AppRole.Admin] },
    ],
  },

  {
    namespace: 'taxes',
    privileges: [
      {
        httpMethod: 'GET',
        roles: [AppRole.Admin, AppRole.Leader, AppRole.FinanceManager],
      },
      { httpMethod: 'DELETE', roles: [AppRole.Admin] },
      { httpMethod: 'PATCH', roles: [AppRole.Admin] },
      { httpMethod: 'POST', roles: [AppRole.Admin] },
    ],
  },

  {
    namespace: 'expense-categories',
    privileges: [
      {
        httpMethod: 'GET',
        roles: [AppRole.Admin, AppRole.Leader, AppRole.FinanceManager],
      },
      { httpMethod: 'DELETE', roles: [AppRole.Admin] },
      { httpMethod: 'PATCH', roles: [AppRole.Admin] },
      { httpMethod: 'POST', roles: [AppRole.Admin] },
    ],
  },

  {
    namespace: 'companies',
    privileges: [
      { httpMethod: 'GET', roles: [AppRole.Admin, AppRole.FinanceManager] },
      { httpMethod: 'DELETE', roles: [AppRole.Admin] },
      { httpMethod: 'PATCH', roles: [AppRole.Admin] },
      { httpMethod: 'POST', roles: [AppRole.Admin] },
    ],
  },

  {
    namespace: 'currencies',
    privileges: [
      {
        httpMethod: 'GET',
        roles: [
          AppRole.Admin,
          AppRole.FinanceManager,
          AppRole.Leader,
          AppRole.FinanceManager,
        ],
      },
      { httpMethod: 'DELETE', roles: [AppRole.Admin] },
      { httpMethod: 'PATCH', roles: [AppRole.Admin, AppRole.FinanceManager] },
      { httpMethod: 'POST', roles: [AppRole.Admin, AppRole.FinanceManager] },
    ],
  },

  {
    namespace: 'users',
    privileges: [
      {
        httpMethod: 'GET',
        roles: [
          AppRole.Admin,
          AppRole.FinanceManager,
          AppRole.OperationsManager,
        ],
      },
      { httpMethod: 'DELETE', roles: [AppRole.Admin] },
      { httpMethod: 'PATCH', roles: [AppRole.Admin, AppRole.FinanceManager] },
      { httpMethod: 'POST', roles: [AppRole.Admin, AppRole.FinanceManager] },
    ],
  },

  {
    namespace: 'products',
    privileges: [
      {
        httpMethod: 'GET',
        roles: [
          AppRole.Admin,
          AppRole.FinanceManager,
          AppRole.Leader,
          AppRole.OperationsManager,
        ],
      },
      { httpMethod: 'DELETE', roles: [AppRole.Admin] },
      { httpMethod: 'PATCH', roles: [AppRole.Admin, AppRole.FinanceManager] },
      { httpMethod: 'POST', roles: [AppRole.Admin, AppRole.FinanceManager] },
    ],
  },

  {
    namespace: 'product-budgets',
    privileges: [
      {
        httpMethod: 'GET',
        roles: [
          AppRole.Admin,
          AppRole.FinanceManager,
          AppRole.OperationsManager,
        ],
      },
    ],
  },

  {
    namespace: 'account-budgets',
    privileges: [
      {
        httpMethod: 'GET',
        roles: [
          AppRole.Admin,
          AppRole.FinanceManager,
          AppRole.OperationsManager,
        ],
      },
    ],
  },

  {
    namespace: 'budget-costs',
    privileges: [
      {
        httpMethod: 'GET',
        roles: [
          AppRole.Admin,
          AppRole.FinanceManager,
          AppRole.OperationsManager,
        ],
      },
    ],
  },

  {
    namespace: 'accounts',
    privileges: [
      {
        httpMethod: 'GET',
        roles: [
          AppRole.Admin,
          AppRole.FinanceManager,
          AppRole.OperationsManager,
          AppRole.Leader,
        ],
      },
      {
        httpMethod: 'DELETE',
        roles: [
          AppRole.Admin,
          AppRole.FinanceManager,
          AppRole.OperationsManager,
          AppRole.Leader,
        ],
      },
      {
        httpMethod: 'PATCH',
        roles: [
          AppRole.Admin,
          AppRole.FinanceManager,
          AppRole.OperationsManager,
          AppRole.Leader,
        ],
      },
      {
        httpMethod: 'POST',
        roles: [
          AppRole.Admin,
          AppRole.FinanceManager,
          AppRole.OperationsManager,
          AppRole.Leader,
        ],
      },
    ],
  },

  {
    namespace: 'receipts',
    privileges: [
      {
        httpMethod: 'GET',
        roles: [
          AppRole.Admin,
          AppRole.FinanceManager,
          AppRole.OperationsManager,
          AppRole.Leader,
        ],
      },
      { httpMethod: 'DELETE', roles: [AppRole.Leader] },
      { httpMethod: 'PATCH', roles: [AppRole.Leader] },
      { httpMethod: 'POST', roles: [AppRole.Leader] },
    ],
  },

  {
    namespace: 'expenses',
    privileges: [
      {
        httpMethod: 'GET',
        roles: [
          AppRole.Admin,
          AppRole.FinanceManager,
          AppRole.OperationsManager,
          AppRole.Leader,
        ],
      },
      { httpMethod: 'DELETE', roles: [AppRole.Admin, AppRole.Leader] },
      { httpMethod: 'PATCH', roles: [AppRole.Admin, AppRole.Leader] },
      { httpMethod: 'POST', roles: [AppRole.Admin, AppRole.Leader] },
    ],
  },

  {
    namespace: 'budgets',
    privileges: [
      { httpMethod: 'GET', roles: [AppRole.Admin, AppRole.FinanceManager] },
      { httpMethod: 'DELETE', roles: [AppRole.Admin, AppRole.FinanceManager] },
      { httpMethod: 'PATCH', roles: [AppRole.Admin, AppRole.FinanceManager] },
      { httpMethod: 'POST', roles: [AppRole.Admin, AppRole.FinanceManager] },
    ],
  },

  {
    namespace: 'budgets/upload',
    privileges: [
      { httpMethod: 'POST', roles: [AppRole.Admin, AppRole.FinanceManager] },
    ],
  },

  {
    namespace: 'costs',
    privileges: [
      { httpMethod: 'GET', roles: [AppRole.Admin, AppRole.FinanceManager] },
      { httpMethod: 'DELETE', roles: [AppRole.Admin] },
      { httpMethod: 'PATCH', roles: [AppRole.Admin] },
      { httpMethod: 'POST', roles: [AppRole.Admin] },
    ],
  },

  {
    namespace: 'sales-tax-groups',
    privileges: [
      {
        httpMethod: 'GET',
        roles: [AppRole.Admin, AppRole.Leader, AppRole.FinanceManager],
      },
      { httpMethod: 'DELETE', roles: [AppRole.Admin] },
      { httpMethod: 'PATCH', roles: [AppRole.Admin] },
      { httpMethod: 'POST', roles: [AppRole.Admin] },
    ],
  },

  {
    namespace: 'businesses',
    privileges: [
      { httpMethod: 'GET', roles: [AppRole.Admin, AppRole.FinanceManager] },
      { httpMethod: 'DELETE', roles: [AppRole.Admin] },
      { httpMethod: 'PATCH', roles: [AppRole.Admin] },
      { httpMethod: 'POST', roles: [AppRole.Admin] },
    ],
  },
  {
    namespace: 'cash-details',
    privileges: [{ httpMethod: 'GET', roles: [AppRole.Admin, AppRole.Leader] }],
  },
  {
    namespace: 'exports/account',
    privileges: [{ httpMethod: 'GET', roles: [AppRole.FinanceManager] }],
  },
];
