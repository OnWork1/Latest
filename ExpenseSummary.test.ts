/* eslint-disable @typescript-eslint/no-explicit-any */
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import ExpenseSummary from '~/components/mobile/card/ExpenseSummary.vue';

describe('Expense Summary Card', () => {
  let wrapper: any;

  beforeAll(() => {
    mockNuxtImport(
      'useOfflineStore',
      vi.fn().mockReturnValue(() => ({
        isOnline: true,
      }))
    );
  });

  beforeEach(() => {
    wrapper = mount(ExpenseSummary, {
      props: {
        editEnabled: true,
        expense: {
          id: 1,
          expenseTitle: 'Test Expense',
          expenseDate: new Date(),
          currencyCode: 'USD',
          amount: 100,
          budgetedAmount: 200,
          status: 'Pending',
          receiptCount: 2,
          expenseTransactionType: 'Manual',
        },
      },
    });
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders expense title', () => {
    expect(wrapper.get('#expense-title').text()).toBe('Test Expense');
  });

  it('renders expense amount', () => {
    expect(wrapper.get('#expense-amount').text()).toBe('100.00'); // assuming currencyFormatter returns formatted string
  });

  it('renders expense status', () => {
    expect(wrapper.get('#expense-status').text()).toBe('Pending');
  });

  it('renders attachment count', () => {
    expect(wrapper.get('#attachment-count').text()).toContain('2');
  });

  it('calls removeExpense when trash icon is clicked', async () => {
    await wrapper.get('.pi-trash').trigger('click');
    await nextTick();
    expect(wrapper.emitted().deleteExpense).toBeTruthy();
    expect(wrapper.emitted().deleteExpense[0]).toEqual([1]);
  });

  it('shows the correct expense title', () => {
    const title = wrapper.find('#expense-title');
    expect(title.text()).toBe(wrapper.props().expense.expenseTitle);
  });

  it('shows the correct expense amount', () => {
    const amount = wrapper.find('#expense-amount');
    expect(amount.text()).toContain(wrapper.props().expense.amount);
  });

  it('renders the correct expense date', () => {
    const expenseDate = wrapper.find('#expense-date');
    expect(expenseDate.text()).toBe(
      convertDateFormat(wrapper.props().expense.expenseDate)
    );
  });

  it('renders the correct expense transaction type', () => {
    const expenseTransactionType = wrapper.find('.text-red-500.cursor-pointer');
    expect(expenseTransactionType.exists()).toBe(
      wrapper.props().expense.expenseTransactionType !== 'AUTO'
    );
  });

  it('renders the edit icon when editEnabled is true', () => {
    const editIcon = wrapper.find('.pi.pi-pencil');
    expect(editIcon.exists()).toBe(true);
  });

  it('does not render the edit icon when editEnabled is false', async () => {
    await wrapper.setProps({ editEnabled: false });
    const editIcon = wrapper.find('.pi.pi-pencil');
    expect(editIcon.exists()).toBe(false);
  });

  it('shows the correct number of attachments', () => {
    const attachments = wrapper.find('#attachment-count');
    expect(attachments.text()).toContain(wrapper.props().expense.receiptCount);
  });

  it('shows the delete button when appropriate', () => {
    const deleteButton = wrapper.find('.pi-trash');
    expect(deleteButton.exists()).toBe(true);
  });

  it('emits the correct event when the delete expense button is clicked', async () => {
    const deleteButton = wrapper.find('.pi-trash');
    await deleteButton.trigger('click');
    expect(wrapper.emitted().deleteExpense).toBeTruthy();
  });
});
