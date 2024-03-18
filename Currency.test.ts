import { mount } from '@vue/test-utils';
import Currency from '~/components/admin/modal/Currency.vue';
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

describe('Add New Currency Modal', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(Currency, {
      global: {
        plugins: [pinia],
      },
    });
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('#currency').exists()).toBe(true);
    expect(wrapper.find('#currencyRate').exists()).toBe(true);
  });

  it('initializes with empty input fields', () => {
    expect(wrapper.find('#currency').element.value).toBeFalsy();
    expect(wrapper.find('#currencyRate').element.value).toBeFalsy();
  });

  it('initializes the currency store correctly', () => {
    const store = useDepartmentStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes app store correctly', () => {
    const store = useAppStore(pinia);
    expect(store).toBeDefined();
  });

  it('displays validation errors when form is submitted with invalid input', async () => {
    await wrapper.find('#save-currency').trigger('click');
    expect(wrapper.find('.p-error').exists()).toBe(true);
  });
});
