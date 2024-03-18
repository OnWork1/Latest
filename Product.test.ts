import { mount } from '@vue/test-utils';
import Product from '~/components/admin/modal/Product.vue';
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

describe('Create New Product Modal', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(Product, {
      global: {
        plugins: [pinia],
      },
    });
  });

  it('renders the product name input', () => {
    expect(wrapper.find('#productName').exists()).toBe(true);
  });

  it('renders the product code input', () => {
    expect(wrapper.find('#productCode').exists()).toBe(true);
  });

  it('renders the duration input', () => {
    expect(wrapper.find('#duration').exists()).toBe(true);
  });

  it('renders the businessId dropdown', () => {
    expect(wrapper.find('#businessId').exists()).toBe(true);
  });

  it('renders the brandId dropdown', () => {
    expect(wrapper.find('#brandId').exists()).toBe(true);
  });

  it('renders the companyId dropdown', () => {
    expect(wrapper.find('#companyId').exists()).toBe(true);
  });

  it('renders the save and close buttons', () => {
    expect(wrapper.find('#save-product').exists()).toBe(true);
    expect(wrapper.find('#close-modal').exists()).toBe(true);
  });

  it('initializes the product store correctly', () => {
    const store = useProductStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes the company store correctly', () => {
    const store = useCompanyStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes the brand store correctly', () => {
    const store = useBrandStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes the business store correctly', () => {
    const store = useBusinessStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes app store correctly', () => {
    const store = useAppStore(pinia);
    expect(store).toBeDefined();
  });

  it('resets the form on close', async () => {
    const closeButton = wrapper.find('#close-modal');
    await closeButton.trigger('click');
    expect(wrapper.find('#productName').element.value).toBe('');
    expect(wrapper.find('#productCode').element.value).toBe('');
  });

  it('shows error message when product name is invalid', async () => {
    await wrapper.find('#productName').setValue('');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.p-error').text()).toContain('Product Name');
  });

  it('calls the correct method when save button is clicked', async () => {
    const methodSpy = vi.spyOn(wrapper.vm, 'onSubmit');
    await wrapper.find('#productName').setValue('New Product');
    await wrapper.find('#save-product').trigger('click');
    expect(methodSpy).toHaveBeenCalled();
  });
});
