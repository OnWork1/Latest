import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { shallowMount } from '@vue/test-utils';
import { beforeAll, vi, expect, describe, it } from 'vitest';
import AccountBudgetList from '~/components/admin/table/AccountBudgetList.vue';

describe(' Account Budget list, emplty data', () => {
  beforeAll(() => {
    vi.mock('primevue/usetoast', () => ({
      useToast: () => ({
        add: vi.fn(),
      }),
    }));

    vi.mock('primevue/usedialog', () => ({
      useDialog: () => ({
        add: vi.fn(),
      }),
    }));

    vi.mock('primevue/useconfirm', () => ({
      useConfirm: () => ({
        require: vi.fn(),
      }),
    }));

    mockNuxtImport(
      'useAccountBudgetStore',
      vi.fn().mockReturnValue(() => ({
        accountBudgetList: [],
        pagination: {
          page: 1,
          perPage: 5,
          totalCount: 0,
          searchString: '',
        },
      }))
    );

    mockNuxtImport(
      'useAppStore',
      vi.fn().mockReturnValue(() => ({
        isLoading: false,
      }))
    );

    mockNuxtImport(
      'useReceiptsStore',
      vi.fn().mockReturnValue(() => ({
        isLoading: false,
        clearReceiptList: vi.fn(),
        fetchReceipts: vi.fn(),
        downloadReceipts: vi.fn(),
        expenseReceiptList: [],
      }))
    );
  });

  it('initializes the brand store correctly', () => {
    const component = shallowMount(AccountBudgetList);
    expect(component).toBeDefined();
    expect(component.html()).toBe(
      '<message-stub closable="false"></message-stub>'
    );
  });
});
