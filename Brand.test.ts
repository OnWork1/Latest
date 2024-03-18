import { mount } from '@vue/test-utils';
import Brand from '~/components/admin/modal/Brand.vue';
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

describe('Create New Brand Modal', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(Brand, {
      global: {
        plugins: [pinia],
      },
    });
  });

  it('renders the form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('#brandName').exists()).toBe(true);
  });

  it('initializes with empty input fields', () => {
    expect(wrapper.find('#brandName').element.value).toBeFalsy();
  });

  it('updates input values when filled by the user', async () => {
    await wrapper.find('#brandName').setValue('Test Brand');
    expect(wrapper.vm.brandName).toBe('Test Brand');
  });

  it('initializes the brand store correctly', () => {
    const store = useBrandStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes app store correctly', () => {
    const store = useAppStore(pinia);
    expect(store).toBeDefined();
  });

  it('displays validation errors when form is submitted with invalid input', async () => {
    await wrapper.find('#save-brand').trigger('click');
    expect(wrapper.find('.p-error').exists()).toBe(true);
  });

  it('clears the form field when the close button is clicked', async () => {
    await wrapper.find('#brandName').setValue('Brand Name');

    await wrapper.find('#close-modal').trigger('click');
    expect(wrapper.find('#brandName').element.value).toBe('');
  });

  it('calls the correct method when save button is clicked', async () => {
    const methodSpy = vi.spyOn(wrapper.vm, 'onSubmit');
    await wrapper.find('#brandName').setValue('Brand Name');
    await wrapper.find('#save-brand').trigger('click');
    expect(methodSpy).toHaveBeenCalled();
  });
});
