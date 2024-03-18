import { z } from 'zod';
import type BrandInputDto from '../dtos/brand/brand-input.dto';
import { paginationSchema } from './pagination.zod';
import type BrandPaginationDto from '../dtos/brand/brand-pagination.dto';
import {
  numberRequiredMessage,
  optionalStringMessage,
  requiredFieldMessage,
} from './zod-message-constants';

export const brandIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .min(1, { message: `Brand Id ${numberRequiredMessage}` }),
});

export const brandInputSchema: z.ZodType<BrandInputDto> = z.object({
  brandName: z
    .string()
    .trim()
    .min(1, { message: `Brand Name ${requiredFieldMessage}` }),
});

export const brandPaginationSchema: z.ZodType<BrandPaginationDto> =
  paginationSchema.extend({
    orderBy: z.enum(['id', 'brandName', 'createdDate'] as const).default('id'),
  });
