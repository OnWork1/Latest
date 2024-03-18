import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { useAccountBudgetStore } from '../useAccountBudgetStore';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { PaginationFilter } from '~/interfaces/common/pagination-filter';
import mockResponse from './fakeData/accountBudgetResponse.json';

const pagination = ref<PaginationFilter>(defaultPaginationValues);
describe('useAccountBudgetStore', () => {
  beforeAll(() => {
    mockNuxtImport(
      'usePagination',
      vi.fn().mockReturnValue(() => ({
        pagination: pagination,
      }))
    );

    mockNuxtImport(
      'useFetchData',
      vi.fn().mockReturnValue(() => ({
        fetchData: vi.fn().mockResolvedValue(mockResponse),
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

  it('should fetch account budgets and update the list', async () => {
    const store = useAccountBudgetStore();
    await store.fetchAccountBudgets();

    expect(store.accountBudgetList).toEqual(mockResponse.data);
  });
});
