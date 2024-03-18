// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  brandIdSchema,
  brandInputSchema,
  brandPaginationSchema,
} from '../brands.zod';

describe('brandIdSchema', () => {
  it.each([
    { input: { id: 123 }, expected: true },
    { input: { id: '123' }, expected: true },
    { input: { id: 'name' }, expected: false },
    { input: { id: 10.5 }, expected: false },
    { input: { id: ' ' }, expected: false },
    { input: { id: -1 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = brandIdSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('brandInputSchema', () => {
  it.each([
    { input: { brandName: 'Valid Brand' }, expected: true },
    { input: { brandName: '   Valid Brand   ' }, expected: true },
    { input: { brandName: '' }, expected: false },
    { input: { brandName: 32323 }, expected: false },
    { input: { brandName: false }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = brandInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('brandPaginationSchema', () => {
  it.each([
    { input: { orderBy: 'brandName' }, expected: true },
    { input: { orderBy: 'invalidField' }, expected: false },
    { input: {}, expected: true, checkDefault: true, defaultValue: 'id' },
  ])(
    'returns $expected when input is $input',
    ({ input, expected, checkDefault, defaultValue }) => {
      const result = brandPaginationSchema.safeParse(input);
      expect(result.success).toBe(expected);
      if (checkDefault && result.success) {
        expect(result.data.orderBy).toBe(defaultValue);
      }
    }
  );
});
