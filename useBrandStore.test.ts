import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PaginationFilter } from '~/interfaces/common/pagination-filter';

const pagination = ref<PaginationFilter>(defaultPaginationValues);
const mockBrandData = [{ id: 1, brandName: 'mybrand' }];
const mockedSetPaginationDetails = vi.fn();

describe('useBrandStore', () => {
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
          data: mockBrandData,
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

  it('Should fetch brand details', async () => {
    const store = useBrandStore();
    await store.fetchBrands();

    expect(store.brandsList).toEqual(mockBrandData);
    expect(mockedSetPaginationDetails).toBeCalledWith('', 1, 5, 0);
  });

  it('Should add brand details', async () => {
    const store = useBrandStore();
    await store.createNewBrand({ id: 3, brandName: 'mybrand 2' });

    expect(store.brandsList).toEqual(mockBrandData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should update brand details', async () => {
    const store = useBrandStore();
    await store.updateBrand({ id: 3, brandName: 'mybrand 3' });

    expect(store.brandsList).toEqual(mockBrandData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should delete brand details', async () => {
    const store = useBrandStore();
    await store.deleteBrand(3);

    expect(store.brandsList).toEqual(mockBrandData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });
});
