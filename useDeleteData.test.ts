import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach } from 'vitest';
import { beforeAll } from 'vitest';
import { describe, it, expect, vi } from 'vitest';
import { useDeleteData } from '~/composables/useDeleteData';
import { ToastType } from '~/enums/toast-type';

export const restHandlers = [
  http.delete('http://localhost:5000/testendpoint/123', () => {
    return HttpResponse.text('test');
  }),
  http.delete('http://localhost:5000/testendpointw/123', () => {
    return HttpResponse.error();
  }),
  http.options('http://localhost:5000/testendpoint/123', () => {
    return HttpResponse.json({ success: 'true' });
  }),
];

const server = setupServer(...restHandlers);

const mockedDisplayMsg = vi.fn();
const mockedDisplayErrorMsg = vi.fn();
const mockedSetLoading = vi.fn();

describe('useDeleteData', () => {
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

  it('should call setLoading with true and display success message when data is deleted successfully', async () => {
    const { deleteData } = useDeleteData();
    await deleteData('testendpoint', 123);
    expect(mockedDisplayMsg).toHaveBeenCalledWith(
      ToastType.Success,
      'Item deleted successfully'
    );
    expect(mockedSetLoading).toBeCalledWith(true);
    expect(mockedSetLoading).toBeCalledWith(false);
  });
});
