import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import AccountList from '../../table/AccountsList.vue';
import { shallowMount } from '@vue/test-utils';

describe('AccountList', () => {
  beforeAll(() => {
    vi.mock('primevue/usetoast', () => ({
      useToast: () => ({
        add: vi.fn(),
      }),
    }));

    vi.mock('primevue/usedialog', () => ({
      useDialog: () => ({
        add: vi.fn(),
      }),
    }));

    vi.mock('primevue/useconfirm', () => ({
      useConfirm: () => ({
        require: vi.fn(),
      }),
    }));

    mockNuxtImport('useUserStore', () => {
      return () => {
        return {
          loggedInUser: {
            name: 'dilusha',
            roles: ['Admin'],
          },
          userList: { name: 'user1' },
          fetchUsers: vi.fn(),
        };
      };
    });

    mockNuxtImport(
      'useAppStore',
      vi.fn().mockReturnValue(() => ({
        isLoading: true,
      }))
    );

    mockNuxtImport(
      'useAccountStore',
      vi.fn().mockReturnValue(() => ({
        accountList: [
          {
            tripCode: 'trp1',
            noOfPassengers: 4,
            productId: 23,
            noOfLeaders: 2,
            accountStatus: 'DRAFT',
            departureDate: '2024-02-12',
          },
        ],
        clearFiltersAndParameters: vi.fn(),
        fetchAccounts: vi.fn(),
        pagination: {
          page: 1,
          perPage: 5,
          totalCount: 0,
          searchString: '',
        },
      }))
    );

    mockNuxtImport(
      'useProductStore',
      vi.fn().mockReturnValue(() => ({
        fetchProducts: vi.fn(),
      }))
    );

    mockNuxtImport(
      'useAccountBudgetStore',
      vi.fn().mockReturnValue(() => ({
        accountBudgetList: [
          {
            expenseTitle: 'Airport Drop',
            date: '2024-02-20T16:00:00.000Z',
            budgetedNoOfPassengers: 0,
            budgetedNoOfLeaders: 0,
            budgetedAmount: '0',
            budgetedBaseCurrencyAmount: '0',
            budgetCurrency: 'LKR',
            accountNoOfPassengers: 4,
            accountNoOfLeaders: 2,
            accountCurrency: 'LKR',
            actualAmount: '0',
            actualBaseCurrencyAmount: '0',
            expenseCode: 'EC-002',
            paymentType: 'CASH',
            taxCode: 'VAT',
            departmentCode: 'DC-001',
            expenseType: 'EXPENSE',
            expenseStatus: 'DRAFT',
          },
        ],
        pagination: {
          page: 1,
          perPage: 5,
          totalCount: 0,
          searchString: '',
        },
      }))
    );
  });

  it('shuold load AccountsList', () => {
    const component = shallowMount(AccountList);
    expect(component.find('data-table-stub').attributes('editingrows')).toBe(
      ''
    );
    expect(component.find('data-table-stub').attributes('editmode')).toBe(
      'row'
    );
    expect(component.find('data-table-stub').attributes('datakey')).toBe('id');
    expect(component.find('data-table-stub').attributes('paginator')).toBe('');
    expect(component.find('data-table-stub').attributes('scrollable')).toBe('');
    expect(component.find('data-table-stub').attributes('rows')).toBe('5');

    expect(component.find('account-export-stub').attributes('visible')).toBe(
      'false'
    );
    expect(component.find('toast-stub').attributes('position')).toBe(
      'bottom-right'
    );
    expect(component.find('confirm-dialog-stub')).toBeTruthy;
  });
});
