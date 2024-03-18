/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BudgetUpload from '~/components/admin/modal/BudgetUpload.vue';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';

const pinia = createTestingPinia({
  createSpy: vi.fn,
});

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
  }),
}));

describe('Budget Upload Modal', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(BudgetUpload, {
      global: {
        plugins: [pinia, PrimeVue],
      },
      props: {
        visible: true,
        productId: 1,
      },
    });
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('initializes the budget store correctly', () => {
    const store = useBudgetStore(pinia);
    expect(store).toBeDefined();
  });

  it('sets the props correctly', () => {
    expect(wrapper.props().visible).toBe(true);
    expect(wrapper.props().productId).toBe(1);
  });

  it('renders the file upload field', async () => {
    expect(wrapper.findComponent({ name: 'FileUpload' }).exists()).toBe(true);
  });

  it('does not show the modal when visible prop is false', async () => {
    await wrapper.setProps({ visible: false });
    expect(wrapper.findComponent({ name: 'FileUpload' }).exists()).toBe(false);
  });
});
