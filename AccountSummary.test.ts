import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import AccountSummary from '~/components/mobile/card/AccountSummary.vue';
import { AccountStatus } from '~/enums/account-status';

describe('AccountSummary.vue', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;
  beforeAll(() => {
    mockNuxtImport(
      'useOfflineStore',
      vi.fn().mockReturnValue(() => ({
        isOnline: true,
      }))
    );
  });
  const mockAccount = {
    id: 1,
    tripCode: 'TRIP123',
    baseCurrencyCode: 'USD',
    totalExpenses: 1000,
    totalBudget: 2000,
    departureDate: '2022-01-01',
    noOfLeaders: 2,
    noOfPassengers: 10,
    accountStatus: AccountStatus.APPROVED,
  };

  beforeEach(() => {
    wrapper = mount(AccountSummary, {
      props: {
        account: mockAccount,
      },
    });
  });

  it('renders total expenses', () => {
    expect(wrapper.text()).toContain(
      currencyFormatter(mockAccount.totalExpenses)
    );
  });

  it('renders trip code', () => {
    const tripCodeText = wrapper.find('h1').text().trim();
    expect(tripCodeText).toBe(mockAccount.tripCode);
  });

  it('renders total budget', () => {
    expect(wrapper.text()).toContain(
      currencyFormatter(mockAccount.totalBudget)
    );
  });

  it('renders departure date', () => {
    expect(wrapper.text()).toContain(
      convertDateFormat(mockAccount.departureDate)
    );
  });

  it('renders number of leaders', () => {
    expect(wrapper.text()).toContain(mockAccount.noOfLeaders);
  });

  it('renders number of passengers', () => {
    expect(wrapper.text()).toContain(mockAccount.noOfPassengers);
  });

  it('does not show edit button if account status is APPROVED', () => {
    expect(wrapper.find('#edit-account-button').exists()).toBe(false);
  });

  it('does not show delete button if account status is APPROVED', () => {
    expect(wrapper.find('#delete-account-button').exists()).toBe(false);
  });

  it('does not show edit button if account status is DRAFT', () => {
    wrapper.setProps({
      account: { ...mockAccount, accountStatus: AccountStatus.DRAFT },
    });
    expect(wrapper.find('#edit-account-button').exists()).toBe(false);
  });

  it('show delete button if account status is DRAFT', async () => {
    wrapper.setProps({
      account: { ...mockAccount, accountStatus: AccountStatus.DRAFT },
    });
    await nextTick();
    expect(wrapper.find('#delete-account-button').exists()).toBe(true);
  });

  it('emits deleteAccount event when delete button is clicked', async () => {
    wrapper.setProps({
      account: { ...mockAccount, accountStatus: AccountStatus.DRAFT },
    });

    await nextTick();
    const deleteButton = wrapper.find('#delete-account-button');
    await deleteButton.trigger('click');
    await nextTick();
    expect(wrapper.emitted()).toHaveProperty('deleteAccount');
  });
});
