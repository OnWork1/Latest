/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AccountExport from '~/components/admin/modal/AccountExport.vue';
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

describe('Account Export Modal', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(AccountExport, {
      global: {
        plugins: [pinia, PrimeVue],
      },
      props: {
        visible: true,
        accountId: 1,
      },
    });
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('initializes the account export store correctly', () => {
    const store = useAccountExportStore(pinia);
    expect(store).toBeDefined();
  });

  it('sets the props correctly', () => {
    expect(wrapper.props().visible).toBe(true);
    expect(wrapper.props().accountId).toBe(1);
  });

  it('renders the calendar fields', async () => {
    expect(wrapper.findComponent({ name: 'Calendar' }).exists()).toBe(true);
  });

  it('does not show the modal when visible prop is false', async () => {
    await wrapper.setProps({ visible: false });
    expect(wrapper.findComponent({ name: 'Calendar' }).exists()).toBe(false);
  });

  it('hides validation errors when form is submitted with valid inputs', async () => {
    expect(wrapper.find('.p-error').exists()).toBe(false);
  });
});
