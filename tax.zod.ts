import { z } from 'zod';
import { paginationSchema } from './pagination.zod';
import type TaxInputDto from '../dtos/tax/tax-input.dto';
import type TaxPaginationDto from '../dtos/tax/tax-pagination.dto';
import {
  numberRequiredMessage,
  requiredFieldMessage,
} from './zod-message-constants';

export const taxIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .min(1, { message: `Tax Id ${numberRequiredMessage}` }),
});

export const taxInputSchema: z.ZodType<TaxInputDto> = z.object({
  taxCode: z
    .string()
    .trim()
    .min(1, { message: `Tax Code ${requiredFieldMessage}` }),
  taxRate: z.coerce.number(),
});

export const taxPaginationSchema: z.ZodType<TaxPaginationDto> =
  paginationSchema.extend({
    orderBy: z.enum(['id', 'taxCode', 'createdDate'] as const).default('id'),
  });
