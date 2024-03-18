/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Cost from '~/components/admin/modal/Cost.vue';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

const pinia = createTestingPinia({
  createSpy: vi.fn,
});

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
  }),
}));

vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => ({
    require: vi.fn(),
  }),
}));

mockNuxtImport(
  'useBudgetCostStore',
  vi.fn().mockReturnValue(() => ({
    costList: [
      {
        id: 1,
        costTypeText: 'Type 1',
        sequence: 10,
        costAmount: 100.0,
      },
      {
        id: 2,
        costTypeText: 'Type 2',
        sequence: 20,
        costAmount: 200.0,
      },
      {
        id: 3,
        costTypeText: 'Type 3',
        sequence: 30,
        costAmount: 300.0,
      },
    ],
    pagination: {
      page: 1,
      perPage: 5,
      totalCount: 0,
      searchString: '',
    },
  }))
);

describe('Cost Modal', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(Cost, {
      global: {
        plugins: [pinia, PrimeVue],
      },
      props: {
        visible: true,
        budgetId: 1,
      },
    });
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('sets the props correctly', () => {
    expect(wrapper.props().visible).toBe(true);
    expect(wrapper.props().budgetId).toBe(1);
  });

  it('initializes the cost store correctly', () => {
    const store = useCostStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes the budget cost store correctly', () => {
    const store = useBudgetCostStore(pinia);
    expect(store).toBeDefined();
  });
});
