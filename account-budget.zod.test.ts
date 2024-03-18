// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { accountbudgetInputSchema } from '../account-budget.zod';

describe('accountbudgetInputSchema', () => {
  it.each([
    { input: { accountId: 'A123', productId: 'P456' }, expected: true },
    { input: { accountId: '  A123  ', productId: '  P456  ' }, expected: true },
    { input: { accountId: '', productId: 'P123' }, expected: false },
    { input: { accountId: 'A123', productId: '' }, expected: false },
    { input: { accountId: '   ', productId: 'P123' }, expected: false },
    { input: { accountId: 'A123', productId: '   ' }, expected: false },
    { input: { accountId: 123, productId: 'P123' }, expected: false },
    { input: { accountId: 'A123', productId: 456 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = accountbudgetInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});
