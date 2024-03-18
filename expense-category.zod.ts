import { z } from 'zod';
import { paginationSchema } from './pagination.zod';
import type ExpenseCategoryInputDto from '../dtos/expense-category/expense-category-input.dto';
import type ExpenseCategoryPaginationDto from '../dtos/expense-category/expense-category-pagination.dto';
import {
  numberRequiredMessage,
  requiredFieldMessage,
} from './zod-message-constants';

export const expenseCategoryIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .min(1, { message: `Expense Category Id ${numberRequiredMessage}` }),
});

export const expenseCategoryInputSchema: z.ZodType<ExpenseCategoryInputDto> =
  z.object({
    expenseName: z
      .string()
      .trim()
      .min(1, { message: `Expense Name ${requiredFieldMessage}` }),
    expenseCode: z
      .string()
      .trim()
      .min(1, { message: `Expense Code ${requiredFieldMessage}` }),
    disablePaymentType: z.boolean(),
    defaultPaymentType: z.enum(['CASH', 'CARD'] as const),
  });

export const expenseCategoryPaginationSchema: z.ZodType<ExpenseCategoryPaginationDto> =
  paginationSchema.extend({
    orderBy: z
      .enum([
        'id',
        'expenseCode',
        'expenseName',
        'defaultPaymentType',
        'disablePaymentType',
        'createdDate',
      ] as const)
      .default('id'),
  });
