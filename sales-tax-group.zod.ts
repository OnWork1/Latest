import { z } from 'zod';
import { paginationSchema } from './pagination.zod';
import {
  numberRequiredMessage,
  requiredFieldMessage,
} from './zod-message-constants';
import type SaleTaxGroupInputDto from '../dtos/sales-tax-group/sales-tax-group-input.dto';
import type SaleTaxGroupPaginationDto from '../dtos/sales-tax-group/sales-tax-group-pagination.dto';

export const salesTaxGroupIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .min(1, { message: `Sales Tax Group Id ${numberRequiredMessage}` }),
});

export const salesTaxGroupInputSchema: z.ZodType<SaleTaxGroupInputDto> =
  z.object({
    salesTaxGroupCode: z
      .string()
      .trim()
      .min(1, { message: `Sales Tax Group Code ${requiredFieldMessage}` }),
  });

export const salesTaxGroupPaginationSchema: z.ZodType<SaleTaxGroupPaginationDto> =
  paginationSchema.extend({
    orderBy: z
      .enum(['id', 'salesTaxGroupCode', 'createdDate'] as const)
      .default('id'),
  });
