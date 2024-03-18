import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PaginationFilter } from '~/interfaces/common/pagination-filter';

const pagination = ref<PaginationFilter>(defaultPaginationValues);
const mockBudgetData = [
  { id: 1, expenseTitle: 'expense', productId: 124, expenseCategoryId: 2 },
];
const mockedSetPaginationDetails = vi.fn();
const mockedDisplayMessage = vi.fn();

global.fetch = vi.fn().mockResolvedValue({
  json: vi.fn().mockResolvedValue({
    response: {
      uploadStatus: true,
      results: [],
    },
  }),
});

describe('useBudgetStore', () => {
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
          data: mockBudgetData,
          pagination: {
            page: 1,
            perPage: 5,
            totalCount: 0,
            searchString: '',
          },
        }),
      }))
    );

    mockNuxtImport(
      'useCreateData',
      vi.fn().mockReturnValue(() => ({
        createData: vi.fn().mockResolvedValue({ id: 3 }),
      }))
    );

    mockNuxtImport(
      'useUpdateData',
      vi.fn().mockReturnValue(() => ({
        updateData: vi.fn().mockResolvedValue({ id: 3 }),
      }))
    );

    mockNuxtImport(
      'useDeleteData',
      vi.fn().mockReturnValue(() => ({
        deleteData: vi.fn().mockResolvedValue({ id: 3 }),
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

  it('Should fetch all budgets', async () => {
    const store = useBudgetStore();
    await store.fetchBudgets();

    expect(store.budgetsList).toEqual(mockBudgetData);
    expect(mockedSetPaginationDetails).toBeCalledWith('', 1, 5, 0);
  });

  it('Should upload new budget file', async () => {
    const store = useBudgetStore();
    const mockedFormData = new FormData();
    await store.uploadNewFile(mockedFormData);

    expect(store.budgetsList).toEqual(mockBudgetData);
    expect(mockedDisplayMessage).toBeCalled();
  });

  it('Should add budget details', async () => {
    const store = useBudgetStore();
    await store.createNewBudget({
      expenseTitle: 'expense',
      productId: 124,
      expenseCategoryId: 3,
    });

    expect(store.budgetsList).toEqual(mockBudgetData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should update budget details', async () => {
    const store = useBudgetStore();
    await store.updateBudget({
      id: 1,
      expenseTitle: 'expense 2',
      productId: 124,
      expenseCategoryId: 3,
    });

    expect(store.budgetsList).toEqual(mockBudgetData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should delete budget details', async () => {
    const store = useBudgetStore();
    await store.deleteBudget(3);

    expect(store.budgetsList).toEqual(mockBudgetData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });
});
