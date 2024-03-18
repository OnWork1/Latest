import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PaginationFilter } from '~/interfaces/common/pagination-filter';

const pagination = ref<PaginationFilter>(defaultPaginationValues);
const mockUserData = [
  {
    id: 1,
    userAccount: 'ccc',
    cardCode: 'card-code',
    cashCode: 'cash-code',
    companyId: 3,
    companyCode: 'company-code',
  },
];
const mockedSetPaginationDetails = vi.fn();

describe('useUserStore', () => {
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
          data: mockUserData,
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

  it('Should fetch all users', async () => {
    const store = useUserStore();
    await store.fetchUsers();

    expect(store.userList).toEqual(mockUserData);
    expect(mockedSetPaginationDetails).toBeCalledWith('', 1, 5, 0);
  });

  it('Should add user details', async () => {
    const store = useUserStore();
    await store.createNewUser({
      userAccount: 'user-acc',
      cardCode: 'card-code=1',
      cashCode: 'cash-code',
      companyId: 3,
      companyCode: 'company-code',
    });

    expect(store.userList).toEqual(mockUserData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should update user details', async () => {
    const store = useUserStore();
    await store.updateUser({
      id: 1,
      userAccount: 'user-acc-updated',
      cardCode: 'card-code',
      cashCode: 'cash-code',
      companyId: 3,
      companyCode: 'company-code',
    });

    expect(store.userList).toEqual(mockUserData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should delete user details', async () => {
    const store = useUserStore();
    await store.deleteUser(3);

    expect(store.userList).toEqual(mockUserData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });
});
