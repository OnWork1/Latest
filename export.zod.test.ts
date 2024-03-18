// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { exportAccountInputSchema } from '../export.zod';

describe('exportAccountInputSchema', () => {
  it.each([
    {
      input: { id: 123, transactionDate: new Date(), documentDate: new Date() },
      expected: true,
    },
    {
      input: {
        id: '123',
        transactionDate: '2022-01-01',
        documentDate: '2022-01-02',
      },
      expected: true,
    },
    {
      input: { id: -1, transactionDate: new Date(), documentDate: new Date() },
      expected: false,
    },
    {
      input: {
        id: 123,
        transactionDate: 'invalid-date',
        documentDate: new Date(),
      },
      expected: false,
    },
    {
      input: {
        id: 123,
        transactionDate: new Date(),
        documentDate: 'invalid-date',
      },
      expected: false,
    },
    {
      input: {
        id: 'invalid',
        transactionDate: new Date(),
        documentDate: new Date(),
      },
      expected: false,
    },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = exportAccountInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});
