import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PaginationFilter } from '~/interfaces/common/pagination-filter';

const pagination = ref<PaginationFilter>(defaultPaginationValues);
const mockCompanyData = [
  { id: 1, companyCode: 'ccc', companyName: 'test', baseCurrencyId: 1 },
];
const mockedSetPaginationDetails = vi.fn();

describe('useCompanyStore', () => {
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
          data: mockCompanyData,
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

  it('Should fetch all companies', async () => {
    const store = useCompanyStore();
    await store.fetchCompanies();

    expect(store.companyList).toEqual(mockCompanyData);
    expect(mockedSetPaginationDetails).toBeCalledWith('', 1, 5, 0);
  });

  it('Should add company details', async () => {
    const store = useCompanyStore();
    await store.createNewCompany({
      id: 2,
      companyCode: 'ccc',
      companyName: 'test',
      baseCurrencyId: 1,
    });

    expect(store.companyList).toEqual(mockCompanyData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should update company details', async () => {
    const store = useCompanyStore();
    await store.updateCompany({
      id: 10,
      companyCode: 'ccc2',
      companyName: 'test',
      baseCurrencyId: 2,
    });

    expect(store.companyList).toEqual(mockCompanyData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });

  it('Should delete company details', async () => {
    const store = useCompanyStore();
    await store.deleteCompany(3);

    expect(store.companyList).toEqual(mockCompanyData);
    expect(store.isOperationSuccessful).toEqual(true);
    expect(mockedSetPaginationDetails).toBeCalled();
  });
});
