// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { productBudgetInputSchema } from '../product-budget.zod';

describe('productBudgetInputSchema', () => {
  it.each([
    { input: { productId: 'P123' }, expected: true },
    { input: { productId: '  P456  ' }, expected: true },
    { input: { productId: '' }, expected: false },
    { input: { productId: '   ' }, expected: false },
    { input: { productId: 123 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = productBudgetInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});
