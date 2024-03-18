// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  salesTaxGroupIdSchema,
  salesTaxGroupInputSchema,
  salesTaxGroupPaginationSchema,
} from '../sales-tax-group.zod';

describe('salesTaxGroupIdSchema', () => {
  it.each([
    { input: { id: 123 }, expected: true },
    { input: { id: '123' }, expected: true },
    { input: { id: 'name' }, expected: false },
    { input: { id: -1 }, expected: false },
    { input: { id: ' ' }, expected: false },
    { input: { id: 10.5 }, expected: false },
    { input: { id: false }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = salesTaxGroupIdSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('salesTaxGroupInputSchema', () => {
  it.each([
    { input: { salesTaxGroupCode: 'STG001' }, expected: true },
    { input: { salesTaxGroupCode: ' STG001 ' }, expected: true },
    { input: { salesTaxGroupCode: '' }, expected: false },
    { input: { salesTaxGroupCode: '  ' }, expected: false },
    { input: { salesTaxGroupCode: 123 }, expected: false },
    { input: { salesTaxGroupCode: false }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = salesTaxGroupInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('salesTaxGroupPaginationSchema', () => {
  it.each([
    { input: { orderBy: 'salesTaxGroupCode' }, expected: true },
    { input: { orderBy: 'invalidField' }, expected: false },
    { input: {}, expected: true, checkDefault: true, defaultValue: 'id' },
  ])(
    'returns $expected when input is $input',
    ({ input, expected, checkDefault, defaultValue }) => {
      const result = salesTaxGroupPaginationSchema.safeParse(input);
      expect(result.success).toBe(expected);
      if (checkDefault && result.success) {
        expect(result.data.orderBy).toBe(defaultValue);
      }
    }
  );
});
