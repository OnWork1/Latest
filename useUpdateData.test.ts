import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach } from 'vitest';
import { beforeAll } from 'vitest';
import { describe, it, expect, vi } from 'vitest';
import { useUpdateData } from '~/composables/useUpdateData';
import { ToastType } from '~/enums/toast-type';

export const restHandlers = [
  http.patch('http://localhost:5000/testendpoint/123', () => {
    return HttpResponse.text('test');
  }),
  http.patch('http://localhost:5000/testendpoint-w/123', () => {
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

describe('useUpdateData', () => {
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
    const { updateData } = useUpdateData();
    await updateData('testendpoint', { id: 123, name: 'test' });
    expect(mockedDisplayMsg).toHaveBeenCalledWith(
      ToastType.Success,
      'Record updated successfully'
    );
    expect(mockedSetLoading).toBeCalledWith(true);
    expect(mockedSetLoading).toBeCalledWith(false);
  });

  it('should displayErrorMessage on error', async () => {
    const { updateData } = useUpdateData();
    await expect(
      updateData('testendpoint-w', { id: 123, name: 'test' })
    ).rejects.toThrowError();
  });
});
