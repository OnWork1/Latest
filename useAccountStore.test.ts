import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PaginationFilter } from '~/interfaces/common/pagination-filter';

const pagination = ref<PaginationFilter>(defaultPaginationValues);
const mockAccountData = [
  {
    tripCode: 'trp1',
    noOfPassengers: 4,
    productId: 23,
    noOfLeaders: 2,
    accountStatus: 'DRAFT',
    departureDate: '2024-02-12',
  },
];
const mockedSetPaginationDetails = vi.fn();

describe('useAccountStore', () => {
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
          data: mockAccountData,
          pagination: {
            page: 1,
            perPage: 5,
            totalCount: 0,
            searchString: '',
          },
        }),
        fetchById: vi.fn().mockResolvedValue({
          id: 3,
          tripCode: 'trp100',
          noOfPassengers: 10,
          productId: 6,
          noOfLeaders: 2,
          accountStatus: 'DRAFT',
          departureDate: '2024-02-12',
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

  it('Should fetch all accounts', async () => {
    const store = useAccountStore();
    await store.fetchAccounts();

    expect(store.accountsList).toEqual(mockAccountData);
    expect(mockedSetPaginationDetails).toBeCalledWith('', 1, 5, 0);
  });

  it('Should fetch requested account', async () => {
    const store = useAccountStore();
    await store.fetchAccountByAccountId(1);

    expect(store.account).toEqual({
      id: 3,
      tripCode: 'trp100',
      noOfPassengers: 10,
      productId: 6,
      noOfLeaders: 2,
      accountStatus: 'DRAFT',
      departureDate: '2024-02-12',
    });
  });

  it('Should add account details', async () => {
    const store = useAccountStore();
    await store.createNewAccount({
      tripCode: 'trp2',
      noOfPassengers: 2,
      productId: 11,
      noOfLeaders: 1,
      accountStatus: 'DRAFT',
      departureDate: '2024-02-06',
    });

    expect(store.accountsList).toEqual(mockAccountData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should update account details', async () => {
    const store = useAccountStore();
    await store.updateAccount({
      id: 2,
      tripCode: 'trp1',
      noOfPassengers: 4,
      productId: 23,
      noOfLeaders: 2,
      accountStatus: 'DRAFT',
      departureDate: '2024-02-10',
    });

    expect(store.accountsList).toEqual(mockAccountData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should delete account details', async () => {
    const store = useAccountStore();
    await store.deleteAccount(3);

    expect(store.accountsList).toEqual(mockAccountData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });
});
