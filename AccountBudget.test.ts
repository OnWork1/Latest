/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount } from '@vue/test-utils';
import AccountBudget from '~/components/admin/modal/AccountBudget.vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

describe('Account Details Modal', () => {
  let wrapper: any;
  let mockDialogRef: any;

  beforeEach(() => {
    mockDialogRef = { value: { close: vi.fn() } };
    wrapper = mount(AccountBudget, {
      global: {
        provide: {
          dialogRef: mockDialogRef,
        },
      },
    });
  });

  it('renders modal component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the tab view and tab panel to display account budget details', () => {
    expect(wrapper.findComponent({ name: 'TabView' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'TabPanel' }).exists()).toBe(true);
  });

  it('renders the account budget list correctly', () => {
    expect(wrapper.findComponent({ name: 'AccountBudgetList' }).exists()).toBe(
      true
    );
  });

  it('renders the close modal button', () => {
    expect(wrapper.findComponent({ name: 'Button' }).exists()).toBe(true);
  });

  it('calls closeModal when Close button is clicked', async () => {
    await wrapper.findComponent({ name: 'Button' }).trigger('click');
    expect(mockDialogRef.value.close).toHaveBeenCalled();
  });
});
