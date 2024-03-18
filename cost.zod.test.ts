// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  costIdSchema,
  costInputSchema,
  costPaginationSchema,
} from '../cost.zod';

describe('costIdSchema', () => {
  it.each([
    { input: { id: 123 }, expected: true },
    { input: { id: '123' }, expected: true },
    { input: { id: 'name' }, expected: false },
    { input: { id: -1 }, expected: false },
    { input: { id: ' ' }, expected: false },
    { input: { id: 10.5 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = costIdSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('costInputSchema', () => {
  it.each([
    {
      input: { costAmount: 100.5, budgetId: 1, costType: 'PERSON' },
      expected: true,
    },
    {
      input: { costAmount: 0, budgetId: 2, costType: 'LEADER' },
      expected: true,
    },
    {
      input: { costAmount: -1, budgetId: 3, costType: 'PERSON' },
      expected: false,
    },
    {
      input: { costAmount: 50, budgetId: 'invalid', costType: 'LEADER' },
      expected: false,
    },
    {
      input: { costAmount: 'invalid', budgetId: 4, costType: 'PERSON' },
      expected: false,
    },
    {
      input: { costAmount: 75, budgetId: 5, costType: 'UNKNOWN' },
      expected: false,
    },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = costInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('costPaginationSchema', () => {
  it.each([
    { input: { orderBy: 'createdDate' }, expected: true },
    { input: { orderBy: 'invalidField' }, expected: false },
    { input: {}, expected: true, checkDefault: true, defaultValue: 'id' },
  ])(
    'returns $expected when input is $input',
    ({ input, expected, checkDefault, defaultValue }) => {
      const result = costPaginationSchema.safeParse(input);
      expect(result.success).toBe(expected);
      if (checkDefault && result.success) {
        expect(result.data.orderBy).toBe(defaultValue);
      }
    }
  );
});
