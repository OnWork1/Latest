/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BudgetUploadErrors from '~/components/admin/modal/BudgetUploadErrors.vue';
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

describe('Budget Upload Errors Modal', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(BudgetUploadErrors, {
      global: {
        plugins: [pinia, PrimeVue],
      },
      props: {
        visible: true,
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
  });

  it('does not show the modal when visible prop is false', async () => {
    await wrapper.setProps({ visible: false });
    expect(wrapper.find('#budget-upload-errors').exists()).toBe(false);
  });

  it('does not emit closeModal when close button is not clicked', async () => {
    expect(wrapper.emitted().closeModal).toBeFalsy();
  });
});
