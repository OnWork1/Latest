/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import SearchAndFilterPanel from '~/components/admin/form/SearchAndFilterPanel.vue';

describe('SearchAndFilterPanel.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(SearchAndFilterPanel, {
      props: {
        title: 'Test Title',
      },
    });
    expect(wrapper.html()).toContain('Test Title');
    expect(wrapper.html()).toContain('What are you looking for?');
  });

  it('emits correct event when search is triggered', async () => {
    const wrapper = mount(SearchAndFilterPanel, {
      props: {
        title: 'Test Title',
      },
    });
    (wrapper.vm as any).searchString = 'test';
    await (wrapper.vm as any).search();
    expect(wrapper.emitted()).toHaveProperty('searchQuery');
    expect(wrapper.emitted().searchQuery[0]).toEqual(['test']);
  });

  it('clears search string correctly', async () => {
    const wrapper = mount(SearchAndFilterPanel, {
      props: {
        title: 'Test Title',
      },
    });
    (wrapper.vm as any).searchString = 'test';
    await wrapper.vm.$nextTick();

    const clearButton = wrapper.find('.pi-times');
    expect(clearButton.exists()).toBe(true);

    await clearButton.trigger('click');
    expect((wrapper.vm as any).searchString).toBe('');
  });

  it('has correct default prop values', () => {
    const wrapper = mount(SearchAndFilterPanel, {
      props: {
        title: 'Test Title',
      },
    });
    expect((wrapper.vm as any).isSearchVisible).toBe(true);
    expect((wrapper.vm as any).placeholderText).toBe(
      'What are you looking for?'
    );
  });

  it('does not display search when isSearchVisible is false', () => {
    const wrapper = mount(SearchAndFilterPanel, {
      props: {
        title: 'Test Title',
        isSearchVisible: false,
      },
    });
    expect(wrapper.find('.p-input-icon-left').exists()).toBe(false);
  });

  it('uses provided placeholderText', () => {
    const wrapper = mount(SearchAndFilterPanel, {
      props: {
        title: 'Test Title',
        placeholderText: 'Custom Placeholder',
      },
    });

    const inputTextComponent = wrapper.findComponent({ name: 'InputText' });
    expect(inputTextComponent.attributes('placeholder')).toBe(
      'Custom Placeholder'
    );
  });
});
