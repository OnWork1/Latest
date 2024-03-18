import { mount } from '@vue/test-utils';
import Tax from '~/components/admin/modal/Tax.vue';
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

describe('Create Sales Tax Modal', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(Tax, {
      global: {
        plugins: [pinia],
      },
    });
  });

  it('renders the form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('#taxCode').exists()).toBe(true);
    expect(wrapper.find('#taxRate').exists()).toBe(true);
  });

  it('renders the save and close buttons correctly', () => {
    expect(wrapper.find('#save-tax').exists()).toBe(true);
    expect(wrapper.find('#close-modal').exists()).toBe(true);
  });

  it('initializes the sales tax store correctly', () => {
    const store = useTaxStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes app store correctly', () => {
    const store = useAppStore(pinia);
    expect(store).toBeDefined();
  });

  it('validates the tax code field correctly', async () => {
    await wrapper.find('#taxCode').setValue('');
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Tax Code is required');
  });

  it('resets the tax code field when the close button is clicked', async () => {
    await wrapper.find('#taxCode').setValue('TC1');
    await wrapper.find('#close-modal').trigger('click');
    expect(wrapper.find('#taxCode').element.value).toBe('');
  });

  it('does not submit the form when tax code is empty', async () => {
    await wrapper.find('#taxCode').setValue('');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.p-error').text()).toContain('Tax Code');
  });

  it('calls the correct method when save button is clicked', async () => {
    const methodSpy = vi.spyOn(wrapper.vm, 'onSubmit');
    await wrapper.find('#taxCode').setValue('taxCode');
    await wrapper.find('#save-tax').trigger('click');
    expect(methodSpy).toHaveBeenCalled();
  });
});
