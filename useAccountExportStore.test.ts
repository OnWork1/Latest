import {
  it,
  describe,
  expect,
  vi,
  beforeAll,
  afterAll,
  afterEach,
} from 'vitest';
import { useAccountExportStore } from '../useAccountExportStore';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';

const buf = Buffer.from('fake buffer text');
let reqType = 'SUCCESS';

export const restHandlers = [
  http.get('https://api.example.com/exports/account', () => {
    if (reqType === 'SUCCESS') {
      return HttpResponse.arrayBuffer(buf, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="sample-file.csv"',
        },
      });
    } else if (reqType === 'NO_CONTENT_DISPOSITION') {
      return HttpResponse.arrayBuffer(buf, {
        headers: {
          'Content-Type': 'text/csv',
        },
      });
    } else {
      return HttpResponse.error();
    }
  }),
];

const server = setupServer(...restHandlers);

describe('useAccountExportStore', () => {
  vi.spyOn(window.URL, 'revokeObjectURL');
  vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('fake-url');
  vi.spyOn(document.body, 'removeChild');

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });

    mockNuxtImport('useRuntimeConfig', () => {
      return () => {
        return { public: { apiUrl: 'https://api.example.com' } };
      };
    });

    mockNuxtImport('useFetchData', () => ({
      fetchData: vi.fn().mockResolvedValue({}),
    }));

    vi.mock('primevue/usetoast', () => ({
      useToast: () => ({
        add: vi.fn(),
      }),
    }));
  });

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it('Should download D365 file with given file name (sample-file.csv)', async () => {
    const store = useAccountExportStore();
    await store.downloadD365File(14, '2024-02-12', '2024-02-01');

    const link = document.createElement('a');
    link.href = 'fake-url';
    link.download = 'sample-file.csv';

    expect(window.URL.revokeObjectURL).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalledWith(link);
  });

  it('Should download D365 file with default file name, due to missing content-disposition header (download)', async () => {
    reqType = 'NO_CONTENT_DISPOSITION';

    const store = useAccountExportStore();
    await store.downloadD365File(14, '2024-02-12', '2024-02-01');

    const link = document.createElement('a');
    link.href = 'fake-url';
    link.download = 'download';

    expect(window.URL.revokeObjectURL).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalledWith(link);
  });

  it('Should throw an error', async () => {
    reqType = 'ERROR';

    const store = useAccountExportStore();
    let isErrorThrown = false;

    try {
      await store.downloadD365File(14, '2024-02-12', '2024-02-01');
    } catch (e) {
      isErrorThrown = true;
      if (e instanceof Error) {
        expect(e.message).toBe('Failed to fetch');
      }
    } finally {
      expect(isErrorThrown).toBeTruthy();
    }
  });
});
