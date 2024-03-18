import { shallowMount } from '@vue/test-utils';
import Brand from '~/components/admin/table/BrandList.vue';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

describe(' Brand list', () => {
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
      'useBrandStore',
      vi.fn().mockReturnValue(() => ({
        fetchBrands: vi.fn(),
        updateBrand: vi.fn(),
        clearFiltersAndParameters: vi.fn(),
        brandsList: [{ id: 1, brandName: 'mybrand' }],
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
  });

  afterAll(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('initializes the brand store correctly', () => {
    const component = shallowMount(Brand);
    expect(component).toBeDefined();

    expect(component.find('[data-key="data-table-stub"]')).toBeTruthy();
    expect(component.find('[data-key="toast-stub"]')).toBeTruthy();
    expect(component.find('[data-key="confirm-dialog-stub"]')).toBeTruthy();
  });
});

describe(' Brand list, empty brand list', () => {
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

    vi.mock('primevue/useconfirm', () => ({
      useConfirm: () => ({
        require: vi.fn(),
      }),
    }));

    mockNuxtImport(
      'useBrandStore',
      vi.fn().mockReturnValue(() => ({
        fetchBrands: vi.fn(),
        updateBrand: vi.fn(),
        clearFiltersAndParameters: vi.fn(),
        brandsList: [],
      }))
    );
  });

  it('initializes the brand store correctly', () => {
    const component = shallowMount(Brand);
    expect(component).toBeDefined();
    expect(component.find('[data-key="message-stub"]')).toBeTruthy();
    expect(component.find('[data-key="toast-stub"]')).toBeTruthy();
    expect(component.find('[data-key="confirm-dialog-stub"]')).toBeTruthy();
  });
});
