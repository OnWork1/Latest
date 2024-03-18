import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PaginationFilter } from '~/interfaces/common/pagination-filter';

const pagination = ref<PaginationFilter>(defaultPaginationValues);
const mockProductData = [
  {
    id: 1,
    productCode: 'code',
    productName: 'name',
    brandId: 124,
    companyId: 3,
  },
];
const mockedSetPaginationDetails = vi.fn();

describe('useProductStore', () => {
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
          data: mockProductData,
          pagination: {
            page: 1,
            perPage: 5,
            totalCount: 0,
            searchString: '',
          },
        }),
        fetchById: vi
          .fn()
          .mockResolvedValue({
            id: 1,
            productCode: 'code',
            productName: 'name',
            brandId: 124,
            companyId: 3,
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

  it('Should fetch all products', async () => {
    const store = useProductStore();
    await store.fetchProducts();

    expect(store.productList).toEqual(mockProductData);
    expect(mockedSetPaginationDetails).toBeCalledWith('', 1, 5, 0);
  });

  it('Should fetch product by id', async () => {
    const store = useProductStore();
    await store.fetchProductById(2);

    expect(store.productList).toEqual(mockProductData);
  });

  it('Should add product details', async () => {
    const store = useProductStore();
    await store.createNewProduct({
      productCode: 'code1',
      productName: 'name1',
      brandId: 124,
      companyId: 3,
    });

    expect(store.productList).toEqual(mockProductData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should update product details', async () => {
    const store = useProductStore();
    await store.updateProduct({
      id: 1,
      productCode: 'code x',
      productName: 'name',
      brandId: 124,
      companyId: 3,
    });

    expect(store.productList).toEqual(mockProductData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should delete product details', async () => {
    const store = useProductStore();
    await store.deleteProduct(3);

    expect(store.productList).toEqual(mockProductData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });
});
