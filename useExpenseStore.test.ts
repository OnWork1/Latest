import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { ToastType } from '~/enums/toast-type';
import type { PaginationFilter } from '~/interfaces/common/pagination-filter';
import type { Expense } from '~/interfaces/models/expense';

const pagination = ref<PaginationFilter>(defaultPaginationValues);
const mockExpenseData = [
  {
    id: 1,
    expenseTiele: 'expense',
    expenseType: 'EXPENSE',
    expenseDate: '2023-02-10',
    status: 'status',
    amount: 100,
  },
];
global.fetch = vi.fn().mockResolvedValue({
  json: vi.fn().mockResolvedValue({
    response: {
      results: [],
    },
  }),
});
const mockedSetPaginationDetails = vi.fn();
const mockedDeleteData = vi.fn();
const mockedDisplayMessage = vi.fn();

describe('useExpenseStore', () => {
  beforeAll(() => {
    mockNuxtImport(
      'usePagination',
      vi.fn().mockReturnValue(() => ({
        pagination: pagination,
        setPaginationDetails: mockedSetPaginationDetails,
      }))
    );

    mockNuxtImport(
      'useFetchData',
      vi.fn().mockReturnValue(() => ({
        fetchData: vi.fn().mockResolvedValue({
          data: mockExpenseData,
          pagination: {
            page: 1,
            perPage: 5,
            totalCount: 0,
            searchString: '',
          },
        }),
        fetchById: vi.fn().mockResolvedValue(mockExpenseData[0]),
      }))
    );

    mockNuxtImport(
      'useDeleteData',
      vi.fn().mockReturnValue(() => ({
        deleteData: mockedDeleteData,
      }))
    );

    mockNuxtImport(
      'useAppStore',
      vi.fn().mockReturnValue(() => ({
        displayMessage: mockedDisplayMessage,
        setLoading: vi.fn(),
        displayErrorMessage: vi.fn(),
      }))
    );

    vi.mock('primevue/usetoast', () => ({
      useToast: () => ({
        add: vi.fn(),
      }),
    }));
  });

  afterAll(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('Should fetch all expenses', async () => {
    const store = useExpenseStore();
    await store.fetchAccountExpenses(1);

    expect(store.accountExpenseList).toEqual(mockExpenseData);
  });

  it('Should add expense details', async () => {
    const store = useExpenseStore();
    await store.createNewExpense(mockExpenseData as unknown as Expense);
    expect(mockedDisplayMessage).toBeCalledWith(
      ToastType.Success,
      'Record created successfully'
    );
  });

  it('Should update expense details', async () => {
    const store = useExpenseStore();
    await store.updateExpense(3, mockExpenseData as unknown as Expense);

    expect(mockedDisplayMessage).toBeCalledWith(
      ToastType.Success,
      'Record updated successfully'
    );
  });

  it('Should delete expense details', async () => {
    const store = useExpenseStore();
    await store.deleteExpense(3, 1);

    expect(store.accountExpenseList).toEqual(mockExpenseData);
  });
});
