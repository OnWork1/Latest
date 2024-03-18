import { z } from 'zod';
import { paginationSchema } from './pagination.zod';
import type BudgetInputDto from '../dtos/budget/budget-input.dto';
import type BudgetPaginationDto from '../dtos/budget/budget-pagination.dto';
import {
  numberRequiredMessage,
  requiredFieldMessage,
} from './zod-message-constants';

export const budgetIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .min(1, { message: `Budget Id ${numberRequiredMessage}` }),
});

export const budgetInputSchema: z.ZodType<BudgetInputDto> = z.object({
  expenseTitle: z
    .string()
    .trim()
    .min(1, { message: `Expense Title ${requiredFieldMessage}` }),

  expenseCategoryId: z.coerce
    .number()
    .int()
    .min(1, { message: `Expense Category Id ${numberRequiredMessage}` }),

  productId: z.coerce
    .number()
    .int()
    .min(1, { message: `Product Id ${numberRequiredMessage}` }),

  dayNumber: z.coerce.number().optional().nullable(),

  paymentType: z
    .enum(['CASH', 'CARD'] as const)
    .nullable()
    .optional(),

  taxId: z.coerce.number().optional().nullable(),
  departmentId: z.coerce.number().optional().nullable(),
  currencyId: z.coerce.number().optional().nullable(),
  salesTaxGroupId: z.coerce.number().optional().nullable(),
});

export const budgetPaginationSchema: z.ZodType<BudgetPaginationDto> =
  paginationSchema.extend({
    orderBy: z
      .enum(['id', 'expenseTitle', 'expenseCode', 'createdDate'] as const)
      .default('id'),
  });
