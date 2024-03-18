/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import PageSizeSelector from '~/components/admin/form/PageSizeSelector.vue';

describe('PageSizeSelector.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(PageSizeSelector);
    expect(wrapper.html()).toContain('Display');
    expect(wrapper.html()).toContain('Items per page');
  });

  it('initial state is correct', () => {
    const wrapper = mount(PageSizeSelector);
    expect((wrapper.vm as any).itemsPerPage).toEqual({ value: 5 });
    expect((wrapper.vm as any).perPageValues).toEqual([
      { value: 5 },
      { value: 10 },
      { value: 15 },
      { value: 20 },
    ]);
    expect(wrapper.vm.recordType).toBe('Items');
  });

  it('has correct default itemsPerPage value', () => {
    const wrapper = mount(PageSizeSelector);
    expect((wrapper.vm as any).itemsPerPage).toEqual({ value: 5 });
  });

  it('emits correct event when dropdown changes', async () => {
    const wrapper = mount(PageSizeSelector);
    await wrapper.findComponent({ name: 'Dropdown' }).vm.$emit('change');
    expect(wrapper.emitted()).toHaveProperty('perPageSize');
    expect(wrapper.emitted().perPageSize[0]).toEqual([{ perPage: 5, page: 1 }]);
  });

  it('has correct dropdown values', () => {
    const wrapper = mount(PageSizeSelector);
    expect((wrapper.vm as any).perPageValues).toEqual([
      { value: 5 },
      { value: 10 },
      { value: 15 },
      { value: 20 },
    ]);
  });

  it('uses "Items" as default recordType', () => {
    const wrapper = mount(PageSizeSelector);
    expect(wrapper.vm.recordType).toBe('Items');
  });

  it('uses provided recordType', () => {
    const wrapper = mount(PageSizeSelector, {
      props: {
        recordType: 'Records',
      },
    });
    expect(wrapper.vm.recordType).toBe('Records');
  });
});
