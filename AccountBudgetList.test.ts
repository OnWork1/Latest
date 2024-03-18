import { shallowMount } from '@vue/test-utils';
import AccountBudgetList from '~/components/admin/table/AccountBudgetList.vue';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

describe('AccountBudgetList', () => {
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

    mockNuxtImport(
      'useAppStore',
      vi.fn().mockReturnValue(() => ({
        isLoading: false,
      }))
    );

    mockNuxtImport(
      'useReceiptsStore',
      vi.fn().mockReturnValue(() => ({
        isLoading: false,
        clearReceiptList: vi.fn(),
        fetchReceipts: vi.fn(),
        downloadReceipts: vi.fn(),
        expenseReceiptList: [
          {
            id: 1,
            expenseId: 2,
            fileExtension: '.csv',
            fileName: 'sample',
            filePath: '/folder/files',
          },
        ],
      }))
    );
  });

  afterAll(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('initializes the accountbudget list correctly', () => {
    const component = shallowMount(AccountBudgetList);
    expect(component).toBeDefined();

    expect(component.find('data-table-stub').attributes('scrollable')).toBe('');
    expect(component.find('data-table-stub').attributes('lazy')).toBe('');
    expect(component.find('data-table-stub').attributes('class')).toBe(
      'mt-3 p-datatable-sm'
    );
  });
});
