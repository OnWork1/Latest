import { describe, it, expect, afterEach, vi, beforeAll } from 'vitest';
import { shallowMount, VueWrapper } from '@vue/test-utils';
// import { createTestingPinia, TestingPinia } from '@pinia/testing';
import TaxDataTable from '~/components/admin/table/TaxList.vue';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

describe('TaxDataTable', () => {
  let wrapper: VueWrapper;

  beforeAll(() => {
    vi.mock('primevue/useconfirm', () => ({
      useConfirm: () => ({
        require: vi.fn(),
      }),
    }));

    mockNuxtImport(
      'useTaxStore',
      vi.fn().mockReturnValue(() => ({
        taxList: [],
        fetchTaxes: vi.fn(),
        updateTax: vi.fn(),
        deleteTax: vi.fn(),
        clearFiltersAndParameters: vi.fn(),
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
        isLoading: true,
      }))
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays a message when there are no taxes and not loading', async () => {
    wrapper = shallowMount(TaxDataTable);
    expect(wrapper.find('#message')).toBeTruthy();
  });
});
