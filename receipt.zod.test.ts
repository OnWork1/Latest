// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  receiptIdSchema,
  receiptInputSchema,
  receiptPaginationSchema,
} from '../receipt.zod';

describe('receiptIdSchema', () => {
  it.each([
    { input: { id: 123 }, expected: true },
    { input: { id: '123' }, expected: true },
    { input: { id: 'name' }, expected: false },
    { input: { id: -1 }, expected: false },
    { input: { id: ' ' }, expected: false },
    { input: { id: 10.5 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = receiptIdSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('receiptInputSchema', () => {
  it.each([
    {
      input: {
        fileName: 'receipt',
        fileExtension: '.pdf',
        filePath: '/files/receipt.pdf',
        file: new Blob(),
      },
      expected: true,
    },
    {
      input: {
        fileName: 'report',
        fileExtension: '.docx',
        filePath: '',
        file: new Blob(),
      },
      expected: true,
    },
    {
      input: {
        fileName: 'summary',
        fileExtension: '.txt',
        filePath: '',
        file: new Blob(),
      },
      expected: true,
    },
    {
      input: {
        fileName: '  ',
        fileExtension: 'pdf',
        filePath: '/files/receipt.pdf',
        file: new Blob(),
      },
      expected: false,
    },
    {
      input: {
        fileName: 'invoice',
        fileExtension: '',
        filePath: '/files/invoice.pdf',
        file: new Blob(),
      },
      expected: false,
    },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = receiptInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('receiptPaginationSchema', () => {
  it.each([
    { input: { orderBy: 'fileName', expenseId: 'E1' }, expected: true },
    { input: { orderBy: 'invalidField', expenseId: 'E456' }, expected: false },
    { input: { expenseId: 'E789' }, expected: true },
    { input: {}, expected: true, checkDefault: true, defaultValue: 'id' },
  ])(
    'returns $expected when input is $input',
    ({ input, expected, checkDefault, defaultValue }) => {
      const result = receiptPaginationSchema.safeParse(input);
      expect(result.success).toBe(expected);
      if (checkDefault && result.success) {
        expect(result.data.orderBy).toBe(defaultValue);
      }
    }
  );
});
