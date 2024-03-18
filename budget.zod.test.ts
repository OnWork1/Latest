// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  budgetIdSchema,
  budgetInputSchema,
  budgetPaginationSchema,
} from '../budget.zod';

describe('budgetIdSchema', () => {
  it.each([
    { input: { id: 123 }, expected: true },
    { input: { id: '123' }, expected: true },
    { input: { id: 'name' }, expected: false },
    { input: { id: -1 }, expected: false },
    { input: { id: ' ' }, expected: false },
    { input: { id: 10.5 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = budgetIdSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('budgetInputSchema', () => {
  it.each([
    {
      input: {
        expenseTitle: 'Supplies',
        expenseCategoryId: 1,
        productId: 1,
        dayNumber: 15,
        paymentType: 'CASH',
        taxId: 5,
        departmentId: 3,
        currencyId: 2,
        salesTaxGroupId: 4,
      },
      expected: true,
    },
    {
      input: {
        expenseTitle: ' Supplies ',
        expenseCategoryId: 1,
        productId: 1,
        dayNumber: 15,
        paymentType: 'CASH',
        taxId: 5,
        departmentId: 3,
        currencyId: 2,
        salesTaxGroupId: 4,
      },
      expected: true,
    },
    {
      input: {
        expenseTitle: ' Supplies ',
        expenseCategoryId: 1,
        productId: 1,
        dayNumber: 15,
        paymentType: null,
        taxId: 5,
        departmentId: 3,
        currencyId: 2,
        salesTaxGroupId: 4,
      },
      expected: true,
    },
    {
      input: {
        expenseTitle: ' Supplies ',
        expenseCategoryId: 1,
        productId: 1,
        dayNumber: null,
        paymentType: null,
        taxId: 5,
        departmentId: 3,
        currencyId: 2,
        salesTaxGroupId: 4,
      },
      expected: true,
    },
    {
      input: {
        expenseTitle: 'Supplies',
        expenseCategoryId: 'invalid',
        productId: 'invalid',
        dayNumber: null,
        paymentType: null,
        taxId: null,
        departmentId: null,
        currencyId: null,
        salesTaxGroupId: null,
      },
      expected: false,
    },
    {
      input: {
        expenseTitle: '',
        expenseCategoryId: 'invalid',
        productId: 'invalid',
        dayNumber: false,
        paymentType: false,
        taxId: false,
        departmentId: false,
        currencyId: false,
        salesTaxGroupId: false,
      },
      expected: false,
    },
    {
      input: {
        expenseTitle: 'Marketing',
        expenseCategoryId: -1,
        productId: 0,
        dayNumber: 'invalid',
        paymentType: 'UNKNOWN',
        taxId: 'invalid',
        departmentId: -1,
        currencyId: -1,
        salesTaxGroupId: -1,
      },
      expected: false,
    },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = budgetInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('budgetPaginationSchema', () => {
  it.each([
    { input: { orderBy: 'expenseTitle' }, expected: true },
    { input: { orderBy: 'invalidField' }, expected: false },
    { input: {}, expected: true, checkDefault: true, defaultValue: 'id' },
  ])(
    'returns $expected when input is $input',
    ({ input, expected, checkDefault, defaultValue }) => {
      const result = budgetPaginationSchema.safeParse(input);
      expect(result.success).toBe(expected);
      if (checkDefault && result.success) {
        expect(result.data.orderBy).toBe(defaultValue);
      }
    }
  );
});
