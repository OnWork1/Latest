// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  companyIdSchema,
  companyInputSchema,
  companyPaginationSchema,
} from '../company.zod';

describe('companyIdSchema', () => {
  it.each([
    { input: { id: 123 }, expected: true },
    { input: { id: '123' }, expected: true },
    { input: { id: 'name' }, expected: false },
    { input: { id: -1 }, expected: false },
    { input: { id: ' ' }, expected: false },
    { input: { id: 10.5 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = companyIdSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('companyInputSchema', () => {
  it.each([
    {
      input: {
        companyCode: 'C001',
        companyName: 'Intrepid Morocco',
        baseCurrencyId: 1,
      },
      expected: true,
    },
    {
      input: {
        companyCode: '  C002  ',
        companyName: '  Intrepid Thailand  ',
        baseCurrencyId: 2,
      },
      expected: true,
    },
    {
      input: {
        companyCode: '  C002  ',
        companyName: '  Intrepid Thailand  ',
        baseCurrencyId: '2',
      },
      expected: true,
    },
    {
      input: {
        companyCode: '',
        companyName: 'Intrepid Thailand',
        baseCurrencyId: 3,
      },
      expected: false,
    },
    {
      input: { companyCode: 'C003', companyName: '', baseCurrencyId: 4 },
      expected: false,
    },
    {
      input: {
        companyCode: '   ',
        companyName: 'Intrepid Europe West',
        baseCurrencyId: 5,
      },
      expected: false,
    },
    {
      input: {
        companyCode: 'C004',
        companyName: 'Intrepid South Africa',
        baseCurrencyId: -1,
      },
      expected: false,
    },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = companyInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('companyPaginationSchema', () => {
  it.each([
    { input: { orderBy: 'companyName' }, expected: true },
    { input: { orderBy: 'invalidField' }, expected: false },
    { input: {}, expected: true, checkDefault: true, defaultValue: 'id' },
  ])(
    'returns $expected when input is $input',
    ({ input, expected, checkDefault, defaultValue }) => {
      const result = companyPaginationSchema.safeParse(input);
      expect(result.success).toBe(expected);
      if (checkDefault && result.success) {
        expect(result.data.orderBy).toBe(defaultValue);
      }
    }
  );
});
