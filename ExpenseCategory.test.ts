import { mount } from '@vue/test-utils';
import ExpenseCategory from '~/components/admin/modal/ExpenseCategory.vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppStore } from '~/stores/useAppStore';
import { createTestingPinia } from '@pinia/testing';

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

describe('Create New Expense Category Modal', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(ExpenseCategory, {
      global: {
        plugins: [pinia],
      },
    });
  });

  it('renders the form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('#expenseName').exists()).toBe(true);
    expect(wrapper.find('#expenseCode').exists()).toBe(true);
    expect(wrapper.find('#defaultPaymentType').exists()).toBe(true);
  });

  it('initializes with empty input fields', () => {
    expect(wrapper.find('#expenseName').element.value).toBeFalsy();
    expect(wrapper.find('#expenseCode').element.value).toBeFalsy();
    expect(wrapper.find('#defaultPaymentType').element.value).toBeFalsy();
  });

  it('updates input values when filled by the user', async () => {
    await wrapper.find('#expenseName').setValue('Test Expense');
    await wrapper.find('#expenseCode').setValue('12345');

    expect(wrapper.vm.expenseName).toBe('Test Expense');
    expect(wrapper.vm.expenseCode).toBe('12345');
  });

  it('initializes the expense category store correctly', () => {
    const store = useExpenseCategoryStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes app store correctly', () => {
    const store = useAppStore(pinia);
    expect(store).toBeDefined();
  });

  it('displays validation errors when form is submitted with invalid input', async () => {
    await wrapper.find('#save-expense-category').trigger('click');
    expect(wrapper.find('.p-error').exists()).toBe(true);
  });

  it('displays correct options in the default payment type dropdown', () => {
    const expectedOptions = paymentTypes.map((type) => type.paymentType);
    const dropdownOptions = wrapper
      .find('#defaultPaymentType')
      .findAll('option');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dropdownOptions.forEach((option: any, index: number) => {
      expect(option.text()).toBe(expectedOptions[index]);
    });
  });
});
