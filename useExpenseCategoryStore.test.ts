import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PaginationFilter } from '~/interfaces/common/pagination-filter';

const pagination = ref<PaginationFilter>(defaultPaginationValues);
const mockExpenseCategoryData = [
  {
    id: 1,
    expenseName: 'ex1',
    expenseCode: 'EX',
    defaultPaymentType: 'CASH',
    disablePaymentType: false,
  },
];
const mockedSetPaginationDetails = vi.fn();

describe('useExpenseCategoryStore', () => {
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
          data: mockExpenseCategoryData,
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

  it('Should fetch all departments', async () => {
    const store = useExpenseCategoryStore();
    await store.fetchExpenseCategories();

    expect(store.expenseCategories).toEqual(mockExpenseCategoryData);
    expect(mockedSetPaginationDetails).toBeCalledWith('', 1, 5, 0);
  });

  it('Should add department details', async () => {
    const store = useExpenseCategoryStore();
    await store.createNewExpenseCategory({
      id: 2,
      expenseName: 'ex2',
      expenseCode: 'EX',
      defaultPaymentType: 'CASH',
      disablePaymentType: false,
    });

    expect(store.expenseCategories).toEqual(mockExpenseCategoryData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should update department details', async () => {
    const store = useExpenseCategoryStore();
    await store.updateExpenseCategory({
      id: 1,
      expenseName: 'ex1',
      expenseCode: 'EX34',
      defaultPaymentType: 'CASH',
      disablePaymentType: false,
    });

    expect(store.expenseCategories).toEqual(mockExpenseCategoryData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should delete department details', async () => {
    const store = useExpenseCategoryStore();
    await store.deleteExpenseCategory(3);

    expect(store.expenseCategories).toEqual(mockExpenseCategoryData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });
});
