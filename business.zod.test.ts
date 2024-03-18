// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  businessIdSchema,
  businessInputSchema,
  businessPaginationSchema,
} from '../business.zod';

describe('businessIdSchema', () => {
  it.each([
    { input: { id: 123 }, expected: true },
    { input: { id: '123' }, expected: true },
    { input: { id: 'name' }, expected: false },
    { input: { id: -1 }, expected: false },
    { input: { id: ' ' }, expected: false },
    { input: { id: 10.5 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = businessIdSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('businessInputSchema', () => {
  it.each([
    {
      input: { businessCode: 'B001', businessName: 'Intrepid SL' },
      expected: true,
    },
    {
      input: { businessCode: '  B002  ', businessName: '  Intrepid IND  ' },
      expected: true,
    },
    {
      input: { businessCode: '', businessName: 'Intrepid SL' },
      expected: false,
    },
    { input: { businessCode: 'B003', businessName: '' }, expected: false },
    {
      input: { businessCode: 12345, businessName: 'Intrepid SL' },
      expected: false,
    },
    { input: { businessCode: 'B003', businessName: 1122 }, expected: false },
    {
      input: { businessCode: '   ', businessName: 'Intrepid SL' },
      expected: false,
    },
    { input: { businessCode: 'B004' }, expected: true },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = businessInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('businessPaginationSchema', () => {
  it.each([
    { input: { orderBy: 'businessName' }, expected: true },
    { input: { orderBy: 'invalidField' }, expected: false },
    { input: {}, expected: true, checkDefault: true, defaultValue: 'id' },
  ])(
    'returns $expected when input is $input',
    ({ input, expected, checkDefault, defaultValue }) => {
      const result = businessPaginationSchema.safeParse(input);
      expect(result.success).toBe(expected);
      if (checkDefault && result.success) {
        expect(result.data.orderBy).toBe(defaultValue);
      }
    }
  );
});
