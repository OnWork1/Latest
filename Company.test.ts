import { mount } from '@vue/test-utils';
import Company from '~/components/admin/modal/Company.vue';
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

describe('Create New Company Modal', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(Company, {
      global: {
        plugins: [pinia],
      },
    });
  });

  it('renders the form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('#companyName').exists()).toBe(true);
    expect(wrapper.find('#companyCode').exists()).toBe(true);
  });

  it('initializes with empty input fields', () => {
    expect(wrapper.find('#companyName').element.value).toBeFalsy();
    expect(wrapper.find('#companyCode').element.value).toBeFalsy();
  });

  it('updates input values when filled by the user', async () => {
    await wrapper.find('#companyName').setValue('Test Company');
    await wrapper.find('#companyCode').setValue('COM001');

    expect(wrapper.vm.companyName).toBe('Test Company');
    expect(wrapper.vm.companyCode).toBe('COM001');
  });

  it('initializes the company store correctly', () => {
    const store = useCompanyStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes app store correctly', () => {
    const store = useAppStore(pinia);
    expect(store).toBeDefined();
  });

  it('displays validation errors when form is submitted with invalid input', async () => {
    await wrapper.find('#save-company').trigger('click');
    expect(wrapper.find('.p-error').exists()).toBe(true);
  });

  it('clears the form field when the close button is clicked', async () => {
    await wrapper.find('#companyName').setValue('Company Name');
    await wrapper.find('#companyCode').setValue('COM003');

    await wrapper.find('#close-modal').trigger('click');
    expect(wrapper.find('#companyName').element.value).toBe('');
    expect(wrapper.find('#companyCode').element.value).toBe('');
  });

  it('calls the correct method when save button is clicked', async () => {
    const methodSpy = vi.spyOn(wrapper.vm, 'onSubmit');
    await wrapper.find('#companyName').setValue('Company Name');
    await wrapper.find('#companyCode').setValue('COM003');
    await wrapper.find('#save-company').trigger('click');
    expect(methodSpy).toHaveBeenCalled();
  });
});
