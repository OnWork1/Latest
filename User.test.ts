import { mount } from '@vue/test-utils';
import User from '~/components/admin/modal/User.vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserStore } from '~/stores/useUserStore';
import { useCompanyStore } from '~/stores/useCompanyStore';
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

describe('Create User Modal', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(User, {
      global: {
        plugins: [pinia],
      },
    });
  });

  it('renders the form', () => {
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('renders the user account input', () => {
    expect(wrapper.find('#userAccount').exists()).toBe(true);
  });

  it('renders the card code input', () => {
    expect(wrapper.find('#cardCode').exists()).toBe(true);
  });

  it('renders the cash code input', () => {
    expect(wrapper.find('#cashCode').exists()).toBe(true);
  });

  it('renders the company dropdown', () => {
    expect(wrapper.find('#company').exists()).toBe(true);
  });

  it('renders the save button', () => {
    expect(wrapper.find('#create-user').exists()).toBe(true);
  });

  it('renders the close button', () => {
    expect(wrapper.find('#close-modal]').exists()).toBe(true);
  });

  it('initializes user store correctly', () => {
    const store = useUserStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes company store correctly', () => {
    const store = useCompanyStore(pinia);
    expect(store).toBeDefined();
  });

  it('initializes app store correctly', () => {
    const store = useAppStore(pinia);
    expect(store).toBeDefined();
  });

  it('validates the form correctly', async () => {
    await wrapper.find('#userAccount').setValue('');
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('User Email is required');
  });

  it('calls the correct method when save button is clicked', async () => {
    const methodSpy = vi.spyOn(wrapper.vm, 'onSubmit');
    await wrapper.find('#userAccount').setValue('testUser');
    await wrapper.find('#cardCode').setValue('1234');
    await wrapper.find('#create-user').trigger('click');

    await wrapper.vm.$nextTick();
    expect(methodSpy).toHaveBeenCalled();
  });

  it('clears the form fields when the close button is clicked', async () => {
    await wrapper.find('#userAccount').setValue('testUser');
    await wrapper.find('#cardCode').setValue('1234');
    await wrapper.find('#close-modal').trigger('click');

    expect(wrapper.find('#userAccount').element.value).toBe('');
    expect(wrapper.find('#cardCode').element.value).toBe('');
  });
});
