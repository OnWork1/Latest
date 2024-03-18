import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PaginationFilter } from '~/interfaces/common/pagination-filter';

const pagination = ref<PaginationFilter>(defaultPaginationValues);
const mockCurrencyData = [
  { id: 1, currencyCode: 'USD', currencyName: 'Dollar', currencyRate: 365 },
];
const mockedSetPaginationDetails = vi.fn();

describe('useCurrencyStore', () => {
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
          data: mockCurrencyData,
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

  it('Should fetch all currencies', async () => {
    const store = useCurrencyStore();
    await store.fetchCurrencies();

    expect(store.currencyList).toEqual(mockCurrencyData);
    expect(mockedSetPaginationDetails).toBeCalledWith('', 1, 5, 0);
  });

  it('Should add currency details', async () => {
    const store = useCurrencyStore();
    await store.createNewCurrency({
      id: 2,
      currencyCode: 'GBR',
      currencyName: 'Pounds',
      currencyRate: 400,
    });

    expect(store.currencyList).toEqual(mockCurrencyData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should update currency details', async () => {
    const store = useCurrencyStore();
    await store.updateCurrency({
      id: 1,
      currencyCode: 'USD',
      currencyName: 'US Dollar',
      currencyRate: 321,
    });

    expect(store.currencyList).toEqual(mockCurrencyData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should delete currency details', async () => {
    const store = useCurrencyStore();
    await store.deleteCurrency(3);

    expect(store.currencyList).toEqual(mockCurrencyData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });
});
