import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { VueWrapper, shallowMount } from '@vue/test-utils';
import { beforeAll, vi, afterAll, expect, describe, it } from 'vitest';
import TaxDataTable from '../../../admin/table/TaxList.vue';

describe.skip('TaxDataTable', () => {
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
        taxList: [{ taxCode: 'tax-code', taxRate: 'tax-rate', id: '123' }],
        fetchTaxes: vi.fn(),
        updateTax: vi.fn(),
        deleteTax: vi.fn(),
        clearFiltersAndParameters: vi.fn(),
        pagination: {
          page: 1,
          perPage: 5,
          totalCount: 1,
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
  });

  it('displays a message when there are taxes and not loading', async () => {
    wrapper = shallowMount(TaxDataTable);
    expect(wrapper.find('data-table-stub').attributes('rows')).toBe('5');
    expect(wrapper.find('data-table-stub').attributes('totalrecords')).toBe(
      '1'
    );
    expect(wrapper.find('data-table-stub').attributes('id')).toBe('taxTable');
  });
});
