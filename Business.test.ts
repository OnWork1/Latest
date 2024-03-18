import { mount } from '@vue/test-utils';
import Business from '~/components/admin/modal/Business.vue';
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

describe('Create New Business Modal', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(Business, {
      global: {
        plugins: [pinia],
      },
    });
  });

  it('renders the form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('#businessName').exists()).toBe(true);
    expect(wrapper.find('#businessCode').exists()).toBe(true);
  });

  it('initializes with empty input fields', () => {
    expect(wrapper.find('#businessName').element.value).toBeFalsy();
    expect(wrapper.find('#businessCode').element.value).toBeFalsy();
  });

  it('updates input values when filled by the user', async () => {
    await wrapper.find('#businessName').setValue('Test Business');
    await wrapper.find('#businessCode').setValue('BSS001');

    expect(wrapper.vm.businessName).toBe('Test Business');
    expect(wrapper.vm.businessCode).toBe('BSS001');
  });

  it('initializes the business store correctly', () => {
    const store = useBusinessStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes app store correctly', () => {
    const store = useAppStore(pinia);
    expect(store).toBeDefined();
  });

  it('displays validation errors when form is submitted with invalid input', async () => {
    await wrapper.find('#save-business').trigger('click');
    expect(wrapper.find('.p-error').exists()).toBe(true);
  });

  it('clears the form field when the close button is clicked', async () => {
    await wrapper.find('#businessName').setValue('Business Name');
    await wrapper.find('#businessCode').setValue('BSS342');

    await wrapper.find('#close-modal').trigger('click');
    expect(wrapper.find('#businessName').element.value).toBe('');
    expect(wrapper.find('#businessCode').element.value).toBe('');
  });

  it('calls the correct method when save button is clicked', async () => {
    const methodSpy = vi.spyOn(wrapper.vm, 'onSubmit');
    await wrapper.find('#businessName').setValue('Business Name');
    await wrapper.find('#businessCode').setValue('BSS242');
    await wrapper.find('#save-business').trigger('click');
    expect(methodSpy).toHaveBeenCalled();
  });
});
