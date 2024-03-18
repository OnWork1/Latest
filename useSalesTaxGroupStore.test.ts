import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PaginationFilter } from '~/interfaces/common/pagination-filter';

const pagination = ref<PaginationFilter>(defaultPaginationValues);
const mockSalesTaxData = [{ id: 1, salesTaxGroupCode: 'ccc' }];
const mockedSetPaginationDetails = vi.fn();

describe('useSalesTaxGroupStore', () => {
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
          data: mockSalesTaxData,
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

  it('Should fetch all sales tax groups', async () => {
    const store = useSalesTaxGroupStore();
    await store.fetchSalesTaxGroups();

    expect(store.salesTaxGroupList).toEqual(mockSalesTaxData);
    expect(mockedSetPaginationDetails).toBeCalledWith('', 1, 5, 0);
  });

  it('Should add sales tax group details', async () => {
    const store = useSalesTaxGroupStore();
    await store.createNewSalesTaxGroup({ salesTaxGroupCode: 'aaa' });

    expect(store.salesTaxGroupList).toEqual(mockSalesTaxData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should update sales tax group details', async () => {
    const store = useSalesTaxGroupStore();
    await store.updateSalesTaxGroup({ id: 1, salesTaxGroupCode: 'ttt' });

    expect(store.salesTaxGroupList).toEqual(mockSalesTaxData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should delete sales tax group details', async () => {
    const store = useSalesTaxGroupStore();
    await store.deleteSalesTaxGroup(3);

    expect(store.salesTaxGroupList).toEqual(mockSalesTaxData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });
});
