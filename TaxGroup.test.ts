import { mount } from '@vue/test-utils';
import TaxGroup from '~/components/admin/modal/TaxGroup.vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('Create Tax Group Modal', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(TaxGroup, {
      global: {
        plugins: [pinia],
      },
    });
  });

  it('renders the form', () => {
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('renders the input field for tax group code', () => {
    expect(wrapper.find('#taxGroupCode').exists()).toBe(true);
  });

  it('renders the save button', () => {
    expect(wrapper.find('#save-tax-group').exists()).toBe(true);
  });

  it('renders the close button', () => {
    expect(wrapper.find('#close-modal"]').exists()).toBe(true);
  });

  it('initializes the sales tax group store correctly', () => {
    const store = useSalesTaxGroupStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes app store correctly', () => {
    const store = useAppStore(pinia);
    expect(store).toBeDefined();
  });

  it('renders the input field for tax group code', () => {
    expect(wrapper.find('#taxGroupCode').exists()).toBe(true);
  });

  it('renders the save button', () => {
    expect(wrapper.find('#save-tax-group').exists()).toBe(true);
  });

  it('renders the close button', () => {
    expect(wrapper.find('#close-modal').exists()).toBe(true);
  });

  it('displays error message when tax group code is invalid', async () => {
    const input = wrapper.find('#taxGroupCode');
    await input.setValue('');
    await wrapper.vm.onSubmit();
    expect(wrapper.find('.p-error').text()).not.toBe('&nbsp;');
  });

  it('does not display error message when tax group code is valid', async () => {
    const input = wrapper.find('#taxGroupCode');
    await input.setValue('validCode');
    await wrapper.vm.onSubmit();
    expect(wrapper.find('.p-error').text()).toBe('');
  });

  it('clears the form field when the close button is clicked', async () => {
    await wrapper.find('#taxGroupCode').setValue('validCode');

    await wrapper.find('#close-modal').trigger('click');
    expect(wrapper.find('#taxGroupCode').element.value).toBe('');
  });

  it('calls the correct method when save button is clicked', async () => {
    const methodSpy = vi.spyOn(wrapper.vm, 'onSubmit');
    await wrapper.find('#taxGroupCode').setValue('validCode');
    await wrapper.find('#save-tax-group').trigger('click');
    expect(methodSpy).toHaveBeenCalled();
  });
});
