// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  productIdSchema,
  productInputSchema,
  productPaginationSchema,
} from '../product.zod';

describe('productIdSchema', () => {
  it.each([
    { input: { id: 123 }, expected: true },
    { input: { id: '123' }, expected: true },
    { input: { id: 'name' }, expected: false },
    { input: { id: -1 }, expected: false },
    { input: { id: ' ' }, expected: false },
    { input: { id: 10.5 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = productIdSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('productInputSchema', () => {
  it.each([
    {
      input: {
        productCode: 'P001',
        productName: 'Intrepid',
        brandId: 1,
        companyId: 1,
        duration: 12,
        costingSheetName: 'Costing Sheet',
        isActive: true,
        businessId: 2,
      },
      expected: true,
    },
    {
      input: {
        productCode: 'P001',
        productName: 'Intrepid',
        brandId: 1,
        companyId: 1,
        costingSheetName: 'Costing Sheet',
        isActive: true,
      },
      expected: true,
    },
    {
      input: {
        productCode: 'P001',
        productName: 'Intrepid',
        brandId: 1,
        companyId: 1,
        duration: 12,
        costingSheetName: 'Costing Sheet',
        isActive: true,
        businessId: 2,
      },
      expected: true,
    },
    {
      input: {
        productCode: 'P001',
        productName: 'Intrepid',
        brandId: 1,
        companyId: 1,
        duration: 12,
        costingSheetName: 'Costing Sheet',
        businessId: 2,
      },
      expected: true,
    },
    {
      input: {
        productCode: ' P001 ',
        productName: 'Intrepid',
        brandId: 1,
        companyId: 1,
        duration: 12,
        costingSheetName: 'Costing Sheet',
        isActive: true,
        businessId: 2,
      },
      expected: true,
    },
    {
      input: {
        productCode: '',
        productName: '',
        brandId: 'invalid',
        companyId: 'invalid',
        duration: 'invalid',
        costingSheetName: '',
        isActive: null,
        businessId: 'invalid',
      },
      expected: false,
    },
    {
      input: {
        productCode: 'P002',
        productName: 'Intrepid',
        brandId: -5,
        companyId: 0,
        duration: -1,
        costingSheetName: 'Costing Sheet',
        isActive: false,
        businessId: 0,
      },
      expected: false,
    },
    {
      input: {
        productCode: 'P002',
        productName: 'Intrepid',
        brandId: -5,
        companyId: -3,
        duration: -1,
        costingSheetName: 'Costing Sheet',
        isActive: false,
        businessId: 0,
      },
      expected: false,
    },
    {
      input: {
        productCode: 'P001',
        productName: 'Intrepid',
        brandId: 1,
        companyId: 1,
        duration: 12,
        costingSheetName: 'Costing Sheet',
        isActive: 'true',
        businessId: 2,
      },
      expected: false,
    },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = productInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('productPaginationSchema', () => {
  it.each([
    { input: { orderBy: 'productCode' }, expected: true },
    { input: { orderBy: 'invalidField' }, expected: false },
    { input: {}, expected: true, checkDefault: true, defaultValue: 'id' },
  ])(
    'returns $expected when input is $input',
    ({ input, expected, checkDefault, defaultValue }) => {
      const result = productPaginationSchema.safeParse(input);
      expect(result.success).toBe(expected);
      if (checkDefault && result.success) {
        expect(result.data.orderBy).toBe(defaultValue);
      }
    }
  );
});
