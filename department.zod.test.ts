// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  departmentIdSchema,
  departmentInputSchema,
  departmentPaginationSchema,
} from '../department.zod';

describe('departmentIdSchema', () => {
  it.each([
    { input: { id: 123 }, expected: true },
    { input: { id: '123' }, expected: true },
    { input: { id: 'name' }, expected: false },
    { input: { id: -1 }, expected: false },
    { input: { id: ' ' }, expected: false },
    { input: { id: 10.5 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = departmentIdSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('departmentInputSchema', () => {
  it.each([
    {
      input: { departmentCode: 'D001', departmentName: 'HR Department' },
      expected: true,
    },
    { input: { departmentCode: '', departmentName: '' }, expected: false },
    { input: { departmentCode: 123, departmentName: ' ' }, expected: false },
    { input: { departmentCode: 123, departmentName: true }, expected: false },
    { input: { departmentCode: 123, departmentName: 123213 }, expected: false },
  ])('returns $expected when input is $input', ({ input, expected }) => {
    const result = departmentInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe('departmentPaginationSchema', () => {
  it.each([
    { input: { orderBy: 'departmentName' }, expected: true },
    { input: { orderBy: 'invalidField' }, expected: false },
    { input: {}, expected: true, checkDefault: true, defaultValue: 'id' },
  ])(
    'returns $expected when input is $input',
    ({ input, expected, checkDefault, defaultValue }) => {
      const result = departmentPaginationSchema.safeParse(input);
      expect(result.success).toBe(expected);
      if (checkDefault && result.success) {
        expect(result.data.orderBy).toBe(defaultValue);
      }
    }
  );
});
