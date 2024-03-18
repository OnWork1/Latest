import { z } from 'zod';
import type ExpenseInputDto from '../dtos/expense/expense-input.dto';
import type ExpensePaginationDto from '../dtos/expense/expense-pagination.dto';

import { paginationSchema } from './pagination.zod';
import {
  numberRequiredMessage,
  requiredFieldMessage,
} from './zod-message-constants';

export const expenseIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const expenseInputSchema: z.ZodType<ExpenseInputDto> = z.object({
  expenseTitle: z
    .string()
    .trim()
    .min(1, { message: `Expense Title ${requiredFieldMessage}` }),
  expenseDate: z
    .string()
    .trim()
    .min(1, { message: `Expense Date ${requiredFieldMessage}` }),
  noOfPassengers: z.coerce.number().nullable().optional(),
  noOfLeaders: z.coerce.number().nullable().optional(),
  accountId: z.coerce
    .number()
    .int()
    .min(1, { message: `Account Id ${numberRequiredMessage}` }),
  amount: z.coerce.number().nullable().optional(),
  currencyId: z.coerce.number().nullable().optional(),
  expenseCategoryId: z.coerce.number().nullable().optional(),
  //paymentType: z.enum(['CASH', 'CARD'] as const).optional(),
  paymentType: z
    .enum(['CASH', 'CARD'] as const)
    .nullable()
    .optional(),
  comment: z.string().nullable().optional(),
  taxId: z.coerce.number().nullable().optional(),
  invoiceNumber: z.string().nullable().optional(),
  departmentId: z.coerce.number().nullable().optional(),
  status: z.enum(['DRAFT', 'CONFIRMED'] as const),
  expenseType: z
    .enum(['EXPENSE', 'WITHDRAWAL'] as const)
    .nullable()
    .optional(),
  salesTaxGroupId: z.coerce.number().nullable().optional(),
});

export const expensePaginationSchema: z.ZodType<ExpensePaginationDto> =
  paginationSchema.extend({
    orderBy: z.enum(['id'] as const).default('id'),
    accountId: z.string().trim().min(1),
  });
