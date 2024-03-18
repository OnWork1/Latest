// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  userIdSchema,
  userInputSchema,
  userPaginationSchema,
} from '../user.zod';

describe('userIdSchema', () => {
  it.each([
    { input: { id: 123 }, expected: true },
    { input: { id: '123' }, expected: true },
    { input: { id: 'name' }, expected: false },
    { input: { id: -1 }, expected: false },
    { input: { id: ' ' }, expected: false },
    { input: { id: 10.5 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = userIdSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('userInputSchema', () => {
  it.each([
    {
      input: {
        userAccount: 'user@example.com',
        cashCode: 'C001',
        cardCode: 'CRD1',
        companyId: 1,
      },
      expected: true,
    },
    {
      input: {
        userAccount: 'user@example.com',
        cashCode: ' C001 ',
        cardCode: ' CRD1 ',
        companyId: 1,
      },
      expected: true,
    },
    {
      input: {
        userAccount: 'user@example.com',
        cashCode: 'C001',
        cardCode: 'CRD1',
        companyId: '1',
      },
      expected: true,
    },
    {
      input: {
        userAccount: 'email',
        cashCode: 'C002',
        cardCode: 'CRD2',
        companyId: 2,
      },
      expected: false,
    },
    { input: { userAccount: 'user@domain.com', companyId: 3 }, expected: true },
    {
      input: {
        userAccount: 'user@website.com',
        cashCode: '',
        cardCode: '',
        companyId: 4,
      },
      expected: true,
    },
    { input: { userAccount: ' ', companyId: 5 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = userInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('userPaginationSchema', () => {
  it.each([
    { input: { orderBy: 'userAccount' }, expected: true },
    { input: { orderBy: 'invalidField' }, expected: false },
    { input: {}, expected: true, checkDefault: true, defaultValue: 'id' },
  ])(
    'returns $expected when input is $input',
    ({ input, expected, checkDefault, defaultValue }) => {
      const result = userPaginationSchema.safeParse(input);
      expect(result.success).toBe(expected);
      if (checkDefault && result.success) {
        expect(result.data.orderBy).toBe(defaultValue);
      }
    }
  );
});
