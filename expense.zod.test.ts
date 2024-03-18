// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  expenseIdSchema,
  expenseInputSchema,
  expensePaginationSchema,
} from '../expense.zod';

describe('expenseIdSchema', () => {
  it.each([
    { input: { id: 123 }, expected: true },
    { input: { id: '123' }, expected: true },
    { input: { id: 'name' }, expected: false },
    { input: { id: -1 }, expected: false },
    { input: { id: ' ' }, expected: false },
    { input: { id: 10.5 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = expenseIdSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('expenseInputSchema', () => {
  it.each([
    {
      input: {
        expenseTitle: 'Travel',
        expenseDate: '2022-01-01',
        accountId: 1,
        amount: 100,
        currencyId: 1,
        status: 'DRAFT',
      },
      expected: true,
    },
    {
      input: {
        expenseTitle: 'Travel',
        expenseDate: '2022-01-01',
        accountId: 1,
        amount: 100,
        noOfPassengers: 1,
        noOfLeaders: 1,
        currencyId: 1,
        expenseCategoryId: 2,
        paymentType: 'CASH',
        comment: 'Traveling to NYC',
        taxId: 3,
        invoiceNumber: 'INV123',
        departmentId: 4,
        status: 'DRAFT',
        expenseType: 'EXPENSE',
        salesTaxGroupId: 5,
      },
      expected: true,
    },
    {
      input: {
        expenseTitle: 'Travel',
        expenseDate: '2022-01-01',
        accountId: 1,
        amount: 100,
        noOfPassengers: '1',
        noOfLeaders: 1,
        currencyId: 1,
        expenseCategoryId: 2,
        paymentType: 'CASH',
        comment: 'Traveling to NYC',
        taxId: 3,
        invoiceNumber: 'INV123',
        departmentId: 4,
        status: 'DRAFT',
        expenseType: 'EXPENSE',
        salesTaxGroupId: 5,
      },
      expected: true,
    },

    {
      input: {
        expenseTitle: 'Travel',
        expenseDate: '2022-01-01',
        accountId: 1,
        amount: 100,
        currencyId: 1,
        expenseCategoryId: 2,
        paymentType: 'CASH',
        comment: 'Traveling to NYC',
        taxId: 3,
        invoiceNumber: 'INV123',
        departmentId: 4,
        status: 'DRAFT',
        expenseType: 'INVALID',
        salesTaxGroupId: 5,
      },
      expected: false,
    },
    {
      input: {
        expenseTitle: 'Travel',
        expenseDate: '2022-01-01',
        accountId: 1,
        amount: 100,
        currencyId: 1,
        expenseCategoryId: 2,
        paymentType: 'CASH',
        comment: 'Traveling to NYC',
        taxId: 3,
        invoiceNumber: false,
        departmentId: 4,
        status: 'DRAFT',
        expenseType: 'INVALID',
        salesTaxGroupId: 5,
      },
      expected: false,
    },

    {
      input: {
        expenseTitle: '',
        expenseDate: '',
        accountId: -1,
        status: 'CONFIRMED',
      },
      expected: false,
    },
    {
      input: {
        expenseTitle: 'Accommodation',
        expenseDate: '2022-01-02',
        accountId: 2,
        status: 'DRAFT',
      },
      expected: true,
    },
    {
      input: {
        expenseTitle: 'Food',
        expenseDate: '2022-01-03',
        accountId: 3,
        status: 'INVALID',
      },
      expected: false,
    },
    {
      input: {
        expenseTitle: 'Entertainment',
        expenseDate: '2022-01-04',
        accountId: 4,
        status: 'CONFIRMED',
      },
      expected: true,
    },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = expenseInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('expensePaginationSchema', () => {
  it.each([
    { input: { orderBy: 'id', accountId: 'A123' }, expected: true },
    { input: { orderBy: 'invalidField', accountId: 'A456' }, expected: false },
    { input: { accountId: 'A789' }, expected: true },
    { input: {}, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = expensePaginationSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});
