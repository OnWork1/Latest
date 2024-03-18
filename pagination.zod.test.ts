// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { paginationSchema } from '../pagination.zod';

describe('paginationSchema', () => {
  it.each([
    {
      input: {
        searchQuery: 'test',
        page: 2,
        perPage: 10,
        orderDirection: 'asc',
      },
      expected: true,
    },
    { input: { page: 3, perPage: 5, orderDirection: 'desc' }, expected: true },
    { input: { page: '4', perPage: '15' }, expected: true },
    { input: { searchQuery: '', page: -1, perPage: 20 }, expected: false },
    { input: { searchQuery: 'find', page: 1, perPage: 0 }, expected: false },
    { input: { searchQuery: 'query', perPage: 10 }, expected: true },
    { input: { page: 5 }, expected: true },
    { input: {}, expected: true },
    { input: { orderDirection: 'invalid' }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = paginationSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});
