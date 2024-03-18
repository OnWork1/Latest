import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import MobileHeader from '../../navigation/MobileHeader.vue';
import { shallowMount } from '@vue/test-utils';

describe('Navigation -> Mobile Header', () => {
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

    mockNuxtImport('useRuntimeConfig', () => {
      return () => {
        return { public: { azureAdTenantId: '123' } };
      };
    });

    mockNuxtImport('useAuth', () => {
      return () => {
        return { signOut: vi.fn() };
      };
    });

    mockNuxtImport('useRoute', () => {
      return () => {
        return {
          path: '/leader/accounts',
          name: 'receipts name',
          query: { accountId: '123' },
        };
      };
    });

    mockNuxtImport('useRouter', () => {
      return () => {
        return {
          push: vi.fn(),
        };
      };
    });

    mockNuxtImport('useOfflineStore', () => {
      return () => {
        return {
          isMobile: true,
          isOnline: true,
        };
      };
    });
    mockNuxtImport('useDepartmentStore', () => {
      return () => {
        return {
          fetchDepartments: vi.fn(),
        };
      };
    });
    mockNuxtImport('useProductStore', () => {
      return () => {
        return {
          fetchProducts: vi.fn(),
        };
      };
    });
    mockNuxtImport('useTaxStore', () => {
      return () => {
        return {
          fetchTaxes: vi.fn(),
        };
      };
    });
    mockNuxtImport('useSalesTaxGroupStore', () => {
      return () => {
        return {
          fetchSalesTaxGroups: vi.fn(),
        };
      };
    });
    mockNuxtImport('useExpenseCategoryStore', () => {
      return () => {
        return {
          fetchExpenseCategories: vi.fn(),
        };
      };
    });
  });

  it('Should load mobile header', () => {
    const component = shallowMount(MobileHeader);
    expect(component.find('div').attributes('class')).toBe(
      'px-3 h-4rem flex justify-content-between align-items-center shadow-1 w-full'
    );
    expect(component.find('nuxt-link-stub').attributes('to')).toBe(
      '/leader/accounts'
    );
    const w4DivSet = component.findAll('.w-4');

    expect(w4DivSet[1].find('nuxt-link-stub').html()).toBe(
      '<nuxt-link-stub to="/leader/accounts"></nuxt-link-stub>'
    );
    expect(w4DivSet[2].find('i').attributes('style')).toBe('color: black;');
  });
});
