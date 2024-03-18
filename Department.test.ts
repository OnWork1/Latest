import { mount } from '@vue/test-utils';
import Department from '~/components/admin/modal/Department.vue';
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

describe('Create New Department Modal', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(Department, {
      global: {
        plugins: [pinia],
      },
    });
  });

  it('renders the form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('#departmentName').exists()).toBe(true);
    expect(wrapper.find('#departmentCode').exists()).toBe(true);
  });

  it('initializes with empty input fields', () => {
    expect(wrapper.find('#departmentName').element.value).toBeFalsy();
    expect(wrapper.find('#departmentCode').element.value).toBeFalsy();
  });

  it('updates input values when filled by the user', async () => {
    await wrapper.find('#departmentName').setValue('Test Department');
    await wrapper.find('#departmentCode').setValue('DEP001');

    expect(wrapper.vm.departmentName).toBe('Test Department');
    expect(wrapper.vm.departmentCode).toBe('DEP001');
  });

  it('initializes the department store correctly', () => {
    const store = useDepartmentStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes app store correctly', () => {
    const store = useAppStore(pinia);
    expect(store).toBeDefined();
  });

  it('displays validation errors when form is submitted with invalid input', async () => {
    await wrapper.find('#save-department').trigger('click');
    expect(wrapper.find('.p-error').exists()).toBe(true);
  });

  it('clears the form field when the close button is clicked', async () => {
    await wrapper.find('#departmentName').setValue('Department Name');
    await wrapper.find('#departmentCode').setValue('DEP003');

    await wrapper.find('#close-modal').trigger('click');
    expect(wrapper.find('#departmentName').element.value).toBe('');
    expect(wrapper.find('#departmentCode').element.value).toBe('');
  });

  it('calls the correct method when save button is clicked', async () => {
    const methodSpy = vi.spyOn(wrapper.vm, 'onSubmit');
    await wrapper.find('#departmentName').setValue('Department Name');
    await wrapper.find('#departmentCode').setValue('DEP003');
    await wrapper.find('#save-department').trigger('click');
    expect(methodSpy).toHaveBeenCalled();
  });
});
