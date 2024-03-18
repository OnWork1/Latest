// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  expenseCategoryIdSchema,
  expenseCategoryInputSchema,
  expenseCategoryPaginationSchema,
} from '../expense-category.zod';

describe('expenseCategoryIdSchema', () => {
  it.each([
    { input: { id: 123 }, expected: true },
    { input: { id: '123' }, expected: true },
    { input: { id: 'name' }, expected: false },
    { input: { id: -1 }, expected: false },
    { input: { id: ' ' }, expected: false },
    { input: { id: 10.5 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = expenseCategoryIdSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('expenseCategoryInputSchema', () => {
  it.each([
    {
      input: {
        expenseName: 'VERUSHKA_EXPENSE_TAX_NAME2',
        expenseCode: 'EC1',
        disablePaymentType: false,
        defaultPaymentType: 'CASH',
      },
      expected: true,
    },
    {
      input: {
        expenseName: 1234,
        expenseCode: 'EC1',
        disablePaymentType: false,
        defaultPaymentType: 'CASH',
      },
      expected: false,
    },
    {
      input: {
        expenseName: '  VERUSHKA_EXPENSE_TAX_NAME22  ',
        expenseCode: 'EC2',
        disablePaymentType: true,
        defaultPaymentType: 'CARD',
      },
      expected: true,
    },
    {
      input: {
        expenseName: '',
        expenseCode: 'EC3',
        disablePaymentType: true,
        defaultPaymentType: 'CASH',
      },
      expected: false,
    },
    {
      input: {
        expenseName: 'VERUSHKA_EXPENSE_TAX_NAME2223',
        expenseCode: '',
        disablePaymentType: false,
        defaultPaymentType: 'CARD',
      },
      expected: false,
    },
    {
      input: {
        expenseName: 'VERUSHKA_EXPENSE_TAX_NAME2223',
        expenseCode: '',
        disablePaymentType: 'false',
        defaultPaymentType: 'CARD',
      },
      expected: false,
    },
    {
      input: {
        expenseName: 'VERUSHKA_EXPENSE_TAX_NAME33',
        expenseCode: 'EC4',
        disablePaymentType: false,
        defaultPaymentType: 'OTHER',
      },
      expected: false,
    },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = expenseCategoryInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('expenseCategoryPaginationSchema', () => {
  it.each([
    { input: { orderBy: 'expenseName' }, expected: true },
    { input: { orderBy: 'invalidField' }, expected: false },
    { input: {}, expected: true, checkDefault: true, defaultValue: 'id' },
  ])(
    'returns $expected when input is $input',
    ({ input, expected, checkDefault, defaultValue }) => {
      const result = expenseCategoryPaginationSchema.safeParse(input);
      expect(result.success).toBe(expected);
      if (checkDefault && result.success) {
        expect(result.data.orderBy).toBe(defaultValue);
      }
    }
  );
});
