import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterAll, beforeAll, describe, vi, it, expect } from 'vitest';

const mockCostList = [{ id: 1, costType: 'type1', costAmount: 122 }];

describe('useBudgetCostStore', () => {
  beforeAll(() => {
    mockNuxtImport(
      'useFetchData',
      vi.fn().mockReturnValue(() => ({
        fetchById: vi.fn().mockResolvedValue(mockCostList),
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

  it('Should set costlist', async () => {
    const store = useBudgetCostStore();
    await store.fetchCostByBudgetId(123);

    expect(store.costList).toEqual(mockCostList);
  });
});
