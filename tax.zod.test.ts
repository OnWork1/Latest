// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { taxIdSchema, taxInputSchema, taxPaginationSchema } from '../tax.zod';

describe('taxIdSchema', () => {
  it.each([
    { input: { id: 123 }, expected: true },
    { input: { id: '123' }, expected: true },
    { input: { id: 'name' }, expected: false },
    { input: { id: -1 }, expected: false },
    { input: { id: ' ' }, expected: false },
    { input: { id: 10.5 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = taxIdSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('taxInputSchema', () => {
  it.each([
    { input: { taxCode: 'VAT', taxRate: 20 }, expected: true },
    { input: { taxCode: '  GST  ', taxRate: 5.5 }, expected: true },
    { input: { taxCode: '', taxRate: 10 }, expected: false },
    { input: { taxCode: 'TAX', taxRate: 'invalid' }, expected: false },
    { input: { taxCode: 'TAX', taxRate: -5 }, expected: true },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = taxInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('taxPaginationSchema', () => {
  it.each([
    { input: { orderBy: 'taxCode' }, expected: true },
    { input: { orderBy: 'invalidField' }, expected: false },
    { input: {}, expected: true, checkDefault: true, defaultValue: 'id' },
  ])(
    'returns $expected when input is $input',
    ({ input, expected, checkDefault, defaultValue }) => {
      const result = taxPaginationSchema.safeParse(input);
      expect(result.success).toBe(expected);
      if (checkDefault && result.success) {
        expect(result.data.orderBy).toBe(defaultValue);
      }
    }
  );
});
