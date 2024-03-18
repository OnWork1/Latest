// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { budgetCostInputSchema } from '../budget-cost.zod';

describe('budgetCostInputSchema', () => {
  it.each([
    { input: { budgetId: 'B001' }, expected: true },
    { input: { budgetId: '  B002  ' }, expected: true },
    { input: { budgetId: '' }, expected: false },
    { input: { budgetId: '   ' }, expected: false },
    { input: { budgetId: 123 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = budgetCostInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});
