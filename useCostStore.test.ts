import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PaginationFilter } from '~/interfaces/common/pagination-filter';

const pagination = ref<PaginationFilter>(defaultPaginationValues);
const mockCostData = [{ id: 1, costType: 'ccc', costAmount: 100 }];
const mockedSetPaginationDetails = vi.fn();

describe('useCostStore', () => {
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
          data: mockCostData,
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

  it('Should fetch all costs', async () => {
    const store = useCostStore();
    await store.fetchCosts();

    expect(store.costList).toEqual(mockCostData);
    expect(mockedSetPaginationDetails).toBeCalledWith('', 1, 5, 0);
  });

  it('Should add cost details', async () => {
    const store = useCostStore();
    await store.createNewCost({ id: 2, costType: 'ccc1', costAmount: 100 });

    expect(store.costList).toEqual(mockCostData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should update cost details', async () => {
    const store = useCostStore();
    await store.updateCost({ id: 3, costType: 'hhh', costAmount: 120 });

    expect(store.costList).toEqual(mockCostData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should delete cost details', async () => {
    const store = useCostStore();
    await store.deleteCost(3);

    expect(store.costList).toEqual(mockCostData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });
});
