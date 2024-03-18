import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PaginationFilter } from '~/interfaces/common/pagination-filter';

const pagination = ref<PaginationFilter>(defaultPaginationValues);
const mockRecieptData = [
  {
    id: 1,
    expenseId: 2,
    fileExtension: '.csv',
    fileName: 'sample',
    filePath: '/folder/files',
  },
];
const mockedSetPaginationDetails = vi.fn();
const mockedDeleteData = vi.fn();

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  headers: {
    'Content-Disposition': 'attachment; filename="sample-file.csv',
    get: vi.fn().mockReturnValue('attachment; filename="sample-file.csv'),
  },
  blob: vi.fn().mockResolvedValue({}),
});

describe('useReceiptsStore', () => {
  vi.spyOn(window.URL, 'revokeObjectURL');
  vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('fake-url');
  vi.spyOn(document.body, 'removeChild');

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
          data: mockRecieptData,
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
        deleteData: mockedDeleteData,
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

  it('Should fetch all reciepts', async () => {
    const store = useReceiptsStore();
    await store.fetchReceipts();

    expect(store.expenseReceiptList).toEqual(mockRecieptData);
  });

  it('Should delete reciept details', async () => {
    const store = useReceiptsStore();
    await store.deleteReceipt(3);

    expect(mockedDeleteData).toBeCalled();
  });

  it('Should download file', async () => {
    const store = useReceiptsStore();
    await store.downloadReceipts(2);

    const link = document.createElement('a');
    link.href = 'fake-url';
    link.download = 'sample-file.csv';

    expect(window.URL.revokeObjectURL).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalledWith(link);
  });
});
