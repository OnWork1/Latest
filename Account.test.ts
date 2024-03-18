/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Account from '~/components/admin/modal/Account.vue';
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

vi.mock('primevue/usedialog', () => ({
  useDialog: () => ({
    add: vi.fn(),
  }),
}));

describe('Create New Account Modal', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(Account, {
      global: {
        plugins: [pinia, PrimeVue],
      },
    });
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('initializes the account store correctly', () => {
    const store = useAccountStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes the product store correctly', () => {
    const store = useProductStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes app store correctly', () => {
    const store = useAppStore(pinia);
    expect(store).toBeDefined();
  });

  it('should render all required input fields', async () => {
    expect(wrapper.find('.p-calendar.p-component').exists()).toBe(true);
    expect(wrapper.find('.p-inputtext').exists()).toBe(true);
    expect(wrapper.find('input.p-inputnumber-input').exists()).toBe(true);
    expect(wrapper.find('.p-dropdown.p-component').exists()).toBe(true);
  });

  it('displays validation errors when form is submitted with invalid input', async () => {
    await wrapper.find('#save-account').trigger('click');
    expect(wrapper.find('.p-error').exists()).toBe(true);
  });

  it('clears the form field when the close button is clicked', async () => {
    await wrapper.find('#tripCode').setValue('TC9812');
    await wrapper.find('#close-modal').trigger('click');
    expect(wrapper.find('#tripCode').element.value).toBe('');
  });

  it('calls the correct method when save button is clicked', async () => {
    const methodSpy = vi.spyOn(wrapper.vm, 'onSubmit');
    await wrapper.find('#tripCode').setValue('TC98493');
    await wrapper.find('#save-account').trigger('click');
    expect(methodSpy).toHaveBeenCalled();
  });
});
