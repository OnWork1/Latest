// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  accountIdSchema,
  accountInputSchema,
  accountPaginationSchema,
} from '../account.zod';

describe('accountIdSchema', () => {
  it.each([
    { input: { id: 123 }, expected: true },
    { input: { id: '123' }, expected: true },
    { input: { id: 'name' }, expected: false },
    { input: { id: -1 }, expected: false },
    { input: { id: ' ' }, expected: false },
    { input: { id: 10.5 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = accountIdSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('accountInputSchema', () => {
  it.each([
    {
      input: {
        tripCode: 'TC001',
        productId: 1,
        accountStatus: 'APPROVED',
        noOfLeaders: 2,
        noOfPassengers: 5,
        departureDate:
          'Tue Feb 13 2024 00:00:00 GMT+0000 (Coordinated Universal Time)',
        leaderUserId: 3,
        reviewerNotes: 'All good',
      },
      expected: true,
    },
    {
      input: {
        tripCode: ' TC001 ',
        productId: 1,
        accountStatus: 'APPROVED',
        noOfLeaders: 2,
        noOfPassengers: 5,
        departureDate: '2023-01-01',
        leaderUserId: 3,
        reviewerNotes: 'All good',
      },
      expected: true,
    },
    {
      input: {
        tripCode: ' TC001 ',
        productId: 1,
        accountStatus: 'APPROVED',
        noOfLeaders: 2,
        noOfPassengers: 5,
        departureDate: '2023-01-01',
        leaderUserId: 3,
      },
      expected: true,
    },
    {
      input: {
        tripCode: ' TC001 ',
        productId: 1,
        accountStatus: 'APPROVED',
        noOfLeaders: 2,
        noOfPassengers: 5,
        departureDate: '2023-01-01',
        reviewerNotes: 'All good',
      },
      expected: true,
    },
    {
      input: {
        tripCode: 'TC001',
        productId: '1',
        accountStatus: 'APPROVED',
        noOfLeaders: '2',
        noOfPassengers: 5,
        departureDate: '2023-01-01',
        leaderUserId: 3,
        reviewerNotes: 'All good',
      },
      expected: true,
    },
    {
      input: {
        tripCode: '',
        productId: 'invalid',
        accountStatus: 'UNKNOWN',
        noOfLeaders: 'invalid',
        noOfPassengers: 'invalid',
        departureDate: '',
        leaderUserId: 'invalid',
        reviewerNotes: '',
      },
      expected: false,
    },
    {
      input: {
        tripCode: 'TC002',
        productId: -1,
        accountStatus: 'REJECTED',
        noOfLeaders: 0,
        noOfPassengers: 0,
        departureDate: '2023-01-02',
        leaderUserId: 0,
        reviewerNotes: 'Needs review',
      },
      expected: false,
    },
    {
      input: {
        tripCode: ' TC001 ',
        productId: 1,
        accountStatus: 'APPROVED',
        noOfLeaders: 2,
        noOfPassengers: 5,
        departureDate: '2023-01-01',
        leaderUserId: null,
        reviewerNotes: 'All good',
      },
      expected: false,
    },
    {
      input: {
        tripCode: ' TC001 ',
        productId: 1,
        accountStatus: 'APPROVED',
        noOfLeaders: 2,
        noOfPassengers: 5,
        departureDate: null,
        leaderUserId: 3,
      },
      expected: false,
    },
    {
      input: {
        tripCode: ' TC001 ',
        productId: 1,
        accountStatus: 'APPROVED',
        noOfLeaders: 2,
        noOfPassengers: 5,
        leaderUserId: null,
        reviewerNotes: 'All good',
      },
      expected: false,
    },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = accountInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('accountPaginationSchema', () => {
  it.each([
    { input: { orderBy: 'tripCode' }, expected: true },
    { input: { orderBy: 'invalidField' }, expected: false },
    { input: {}, expected: true, checkDefault: true, defaultValue: 'id' },
  ])(
    'returns $expected when input is $input',
    ({ input, expected, checkDefault, defaultValue }) => {
      const result = accountPaginationSchema.safeParse(input);
      expect(result.success).toBe(expected);
      if (checkDefault && result.success) {
        expect(result.data.orderBy).toBe(defaultValue);
      }
    }
  );
});
