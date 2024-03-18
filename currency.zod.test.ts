// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  currencyIdSchema,
  currencyInputSchema,
  currencyPaginationSchema,
} from '../currency.zod';

describe('currencyIdSchema', () => {
  it.each([
    { input: { id: 123 }, expected: true },
    { input: { id: '123' }, expected: true },
    { input: { id: 'name' }, expected: false },
    { input: { id: -1 }, expected: false },
    { input: { id: ' ' }, expected: false },
    { input: { id: 10.5 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = currencyIdSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('currencyInputSchema', () => {
  it.each([
    {
      input: {
        currencyCode: 'USD',
        currencyName: 'US Dollar',
        currencyRate: 1,
      },
      expected: true,
    },
    {
      input: {
        currencyCode: 'USD',
        currencyName: 'US Dollar',
        currencyRate: 1.5,
      },
      expected: true,
    },
    {
      input: { currencyCode: '', currencyName: '', currencyRate: -1 },
      expected: false,
    },
    {
      input: {
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencyRate: 'invalid',
      },
      expected: false,
    },
    {
      input: { currencyCode: 123, currencyName: true, currencyRate: 0.9 },
      expected: false,
    },
    {
      input: { currencyCode: 'GBP', currencyName: 'Pound', currencyRate: -5 },
      expected: false,
    },
    {
      input: {
        currencyCode: ['GBP', 'EUR', 'USD'],
        currencyName: 'Pound',
        currencyRate: -5,
      },
      expected: false,
    },
    {
      input: { currencyCode: false, currencyName: 'Pound', currencyRate: -5 },
      expected: false,
    },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = currencyInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('currencyPaginationSchema', () => {
  it.each([
    { input: { orderBy: 'currencyName' }, expected: true },
    { input: { orderBy: 'invalidField' }, expected: false },
    { input: {}, expected: true, checkDefault: true, defaultValue: 'id' },
  ])(
    'returns $expected when input is $input',
    ({ input, expected, checkDefault, defaultValue }) => {
      const result = currencyPaginationSchema.safeParse(input);
      expect(result.success).toBe(expected);
      if (checkDefault && result.success) {
        expect(result.data.orderBy).toBe(defaultValue);
      }
    }
  );
});
