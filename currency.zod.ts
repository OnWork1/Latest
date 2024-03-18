import { z } from 'zod';
import { paginationSchema } from './pagination.zod';
import type CurrencyInputDto from '../dtos/currency/currency-input.dto';
import type CurrencyPaginationDto from '../dtos/currency/currency-pagination.dto';
import {
  numberRequiredMessage,
  requiredFieldMessage,
} from './zod-message-constants';

export const currencyIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .min(1, { message: `Currency Id ${numberRequiredMessage}` }),
});

export const currencyInputSchema: z.ZodType<CurrencyInputDto> = z.object({
  currencyCode: z
    .string()
    .trim()
    .min(1, { message: `Currency Code ${requiredFieldMessage}` }),
  currencyName: z
    .string()
    .trim()
    .min(1, { message: `Currency Name ${requiredFieldMessage}` }),
  currencyRate: z.coerce
    .number()
    .min(0, { message: `Currency Rate ${numberRequiredMessage}` }),
});

export const currencyPaginationSchema: z.ZodType<CurrencyPaginationDto> =
  paginationSchema.extend({
    orderBy: z
      .enum(['id', 'currencyCode', 'currencyName', 'createdDate'] as const)
      .default('id'),
  });
