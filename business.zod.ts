import { z } from 'zod';
import type BusinessInputDto from '../dtos/business/business-input.dto';
import type BusinessPaginationDto from '../dtos/business/business-pagination.dto';
import { paginationSchema } from './pagination.zod';

import {
  numberRequiredMessage,
  requiredFieldMessage,
} from './zod-message-constants';

export const businessIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .min(1, { message: `Business Id ${numberRequiredMessage}` }),
});

export const businessInputSchema: z.ZodType<BusinessInputDto> = z.object({
  businessCode: z
    .string()
    .trim()
    .min(1, { message: `Business Code ${requiredFieldMessage}` }),
  businessName: z
    .string()
    .trim()
    .min(1, { message: `Business Name ${requiredFieldMessage}` })
    .optional(),
});

export const businessPaginationSchema: z.ZodType<BusinessPaginationDto> =
  paginationSchema.extend({
    orderBy: z
      .enum(['id', 'businessCode', 'businessName', 'createdDate'] as const)
      .default('id'),
  });
