/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Budget from '~/components/admin/modal/Budget.vue';
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

describe('Create New Budget Modal', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(Budget, {
      global: {
        plugins: [pinia, PrimeVue],
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

  it('initializes the tax store correctly', () => {
    const store = useTaxStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes the department store correctly', () => {
    const store = useDepartmentStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes the currency store correctly', () => {
    const store = useCurrencyStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes app store correctly', () => {
    const store = useAppStore(pinia);
    expect(store).toBeDefined();
  });

  it('renders all required input fields', async () => {
    expect(wrapper.find('#expenseTitle').exists()).toBe(true);
    expect(wrapper.find('#expenseCategoryId').exists()).toBe(true);
    expect(wrapper.find('#dayNumber').exists()).toBe(true);
    expect(wrapper.find('#taxId').exists()).toBe(true);
    expect(wrapper.find('#taxGroupId').exists()).toBe(true);
    expect(wrapper.find('#paymentType').exists()).toBe(true);
    expect(wrapper.find('#departmentId').exists()).toBe(true);
    expect(wrapper.find('#currencyId').exists()).toBe(true);
  });

  it('displays validation errors when form is submitted with invalid input', async () => {
    await wrapper.find('#save-budget').trigger('click');
    expect(wrapper.find('.p-error').exists()).toBe(true);
  });

  it('clears the form field when the close button is clicked', async () => {
    await wrapper.find('#expenseTitle').setValue('Food and Drinks');
    await wrapper.find('#close-modal').trigger('click');
    expect(wrapper.find('#expenseTitle').element.value).toBe('');
  });

  it('calls the correct method when save button is clicked', async () => {
    const methodSpy = vi.spyOn(wrapper.vm, 'onSubmit');
    await wrapper.find('#expenseTitle').setValue('Transport');
    await wrapper.find('#save-budget').trigger('click');
    expect(methodSpy).toHaveBeenCalled();
  });
});
