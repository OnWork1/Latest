import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Product from '~/components/admin/card/product.vue';

describe('product.vue', () => {
  it('renders product details when passed', () => {
    const product = {
      id: 1,
      productName: 'Test Product',
      brandName: 'Test Brand',
      companyName: 'Test Company',
      productCode: 'TP001',
      brandCode: 'TB001',
      companyCode: 'TC001',
    };

    const wrapper = mount(Product, {
      propsData: { product },
    });

    expect(wrapper.find('#product-name').text()).toBe(product.productName);
    expect(wrapper.find('#product-brand').text()).toBe(product.brandName);
    expect(wrapper.find('#company-name').text()).toBe(product.companyName);
    expect(wrapper.find('#product-code').text()).toBe(product.productCode);
    expect(wrapper.find('#company-code').text()).toBe(product.companyCode);
  });

  it('does not render product details if product prop is not passed', () => {
    const wrapper = mount(Product);

    expect(wrapper.find('#product-name').exists()).toBe(false);
    expect(wrapper.find('#product-brand').exists()).toBe(false);
    expect(wrapper.find('#company-name').exists()).toBe(false);
    expect(wrapper.find('#product-code').exists()).toBe(false);
    expect(wrapper.find('#company-code').exists()).toBe(false);
  });
});
