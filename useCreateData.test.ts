import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach } from 'vitest';
import { beforeAll } from 'vitest';
import { describe, it, expect, vi } from 'vitest';
import { useCreateData } from '~/composables/useCreateData';
import { ToastType } from '~/enums/toast-type';

export const restHandlers = [
  http.post('http://localhost:5000/testendpoint', () => {
    return HttpResponse.text('test');
  }),
  http.post('http://localhost:5000/testendpoint-w', () => {
    return HttpResponse.error();
  }),
  http.options('http://localhost:5000/testendpoint', () => {
    return HttpResponse.json({ success: 'true' });
  }),
];

const server = setupServer(...restHandlers);

const mockedDisplayMsg = vi.fn();
const mockedDisplayErrorMsg = vi.fn();
const mockedSetLoading = vi.fn();

describe('useCreateData', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });

    mockNuxtImport('useRuntimeConfig', () => {
      return () => {
        return { public: { apiUrl: 'http://localhost:5000' } };
      };
    });
    mockNuxtImport('useAppStore', () => {
      return () => ({
        setLoading: mockedSetLoading,
        displayMessage: mockedDisplayMsg,
        displayErrorMessage: mockedDisplayErrorMsg,
      });
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

  it('should call setLoading with true and display success message when data is created successfully', async () => {
    const { createData } = useCreateData();
    await createData('testendpoint', {});
    expect(mockedDisplayMsg).toHaveBeenCalledWith(
      ToastType.Success,
      'Record created successfully'
    );
    expect(mockedSetLoading).toBeCalledWith(true);
    expect(mockedSetLoading).toBeCalledWith(false);
  });

  it('should displayErrorMessage on error', async () => {
    const { createData } = useCreateData();
    await expect(createData('testendpoint-w', {})).rejects.toThrowError();
  });
});
