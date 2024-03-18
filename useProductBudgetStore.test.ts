import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PaginationFilter } from '~/interfaces/common/pagination-filter';
import mockPrdBgtData from './fakeData/productBudgetResponse.json';

const pagination = ref<PaginationFilter>(defaultPaginationValues);
const mockedSetPaginationDetails = vi.fn();

describe('useProductBudgetStore', () => {
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
          data: mockPrdBgtData,
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

  it('Should fetch all product budgets', async () => {
    const store = useProductBudgetStore();
    await store.fetchProductBudgets(23);

    expect(store.productBudgetsList).toEqual(mockPrdBgtData);
    expect(mockedSetPaginationDetails).toBeCalledWith('', 1, 5, 0);
  });

  it('Should add product budget details', async () => {
    const store = useProductBudgetStore();
    await store.createNewProductBudget({
      id: 41,
      expenseTitle: 'Hassan II mosuqe',
      expenseCode: 'EX01',
      dayNumber: 2,
      currencyCode: 'MAD',
      currencyId: 3,
      paymentType: 'CASH',
      taxCode: 'BTT',
      taxId: 2,
      departmentCode: 'DEPT01',
      departmentId: 2,
      productCode: 'P001',
      productId: 3,
      noOfPassengers: 1,
      noOfLeaders: 1,
      totalBudget: '200',
    });

    expect(store.productBudgetsList).toEqual(mockPrdBgtData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should update product budget details', async () => {
    const store = useProductBudgetStore();
    await store.updateProductBudget({
      id: 41,
      expenseTitle: 'Dilusha',
      expenseCode: 'EX01',
      dayNumber: 2,
      currencyCode: 'MAD',
      currencyId: 3,
      paymentType: 'CASH',
      taxCode: 'BTT',
      taxId: 2,
      departmentCode: 'DEPT01',
      departmentId: 2,
      productCode: 'P001',
      productId: 3,
      noOfPassengers: 1,
      noOfLeaders: 1,
      totalBudget: '200',
    });

    expect(store.productBudgetsList).toEqual(mockPrdBgtData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should delete product budget details', async () => {
    const store = useProductBudgetStore();
    await store.deleteProductBudget(3, 41);

    expect(store.productBudgetsList).toEqual(mockPrdBgtData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });
});
