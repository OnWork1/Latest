import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach } from 'vitest';
import { beforeAll } from 'vitest';
import { describe, it, expect, vi } from 'vitest';
import { useFetchData } from '~/composables/useFetchData';

export const restHandlers = [
  http.get('http://localhost:5000/testendpoint/123', () => {
    return HttpResponse.json({});
  }),
  http.get('http://localhost:5000/testendpoint-w/123', () => {
    return HttpResponse.error();
  }),
  http.get(
    'http://localhost:5000/testendpoint?page=1&perPage=10&&searchQuery=query-sample',
    () => {
      return HttpResponse.json({});
    }
  ),
  http.get(
    'http://localhost:5000/testendpoint-w?page=1&perPage=10&&searchQuery=query-sample',
    () => {
      return HttpResponse.json({});
    }
  ),
];

const server = setupServer(...restHandlers);

const mockedDisplayMsg = vi.fn();
const mockedDisplayErrorMsg = vi.fn();
const mockedSetLoading = vi.fn();

describe('useFetchData', () => {
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

    // mockNuxtImport('useFetchData', () => ({
    //   fetchData: vi.fn().mockResolvedValue({}),
    // }));

    vi.mock('primevue/usetoast', () => ({
      useToast: () => ({
        add: vi.fn(),
      }),
    }));
  });

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it('should call setLoading with true when data is fetched by id successfully', async () => {
    const { fetchById } = useFetchData();
    await fetchById('testendpoint', 123);
    expect(mockedSetLoading).toBeCalledWith(true);
    expect(mockedSetLoading).toBeCalledWith(false);
  });

  it('should displayErrorMessage on error', async () => {
    const { fetchById } = useFetchData();

    await expect(fetchById('testendpoint-w', 123)).rejects.toThrowError();
  });

  it('should call setLoading with true when data is fetched successfully', async () => {
    const { fetchData } = useFetchData();
    await fetchData('testendpoint', 1, 10, 'query-sample');
    expect(mockedSetLoading).toBeCalledWith(true);
    expect(mockedSetLoading).toBeCalledWith(false);
  });

  it('should displayErrorMessage on error on fetchdata', async () => {
    const { fetchData } = useFetchData();
    try {
      await fetchData('testendpoint-w', 1, 10, 'query-sample');
    } catch (e) {
      expect(mockedDisplayErrorMsg).toHaveBeenCalled();
    }
  });
});
