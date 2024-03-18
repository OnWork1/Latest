import { z } from 'zod';
import { paginationSchema } from './pagination.zod';
import { type ProductInputDto } from '../dtos/product/product-input.dto';
import type ProductPaginationDto from '../dtos/product/product-pagination.dto';
import {
  numberRequiredMessage,
  optionalStringMessage,
  requiredFieldMessage,
} from './zod-message-constants';

export const productIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .min(1, { message: `Product Id ${numberRequiredMessage}` }),
});

export const productInputSchema: z.ZodType<ProductInputDto> = z.object({
  productCode: z
    .string()
    .trim()
    .min(1, { message: `Product Code ${requiredFieldMessage}` }),
  productName: z
    .string()
    .trim()
    .min(1, { message: `Product Name ${requiredFieldMessage}` }),
  brandId: z.coerce
    .number()
    .int()
    .min(1, { message: `Brand Id ${numberRequiredMessage}` }),
  companyId: z.coerce
    .number()
    .int()
    .min(1, { message: `Company Id ${numberRequiredMessage}` }),
  duration: z.coerce.number().optional(),
  costingSheetName: z.optional(
    z
      .string()
      .trim()
      .min(1, { message: `Costing Sheet Name ${optionalStringMessage}` })
  ),
  isActive: z.boolean().optional(),
  businessId: z.coerce
    .number()
    .int()
    .min(1, { message: `Business Id ${numberRequiredMessage}` })
    .optional(),
});

export const productPaginationSchema: z.ZodType<ProductPaginationDto> =
  paginationSchema.extend({
    orderBy: z
      .enum(['id', 'productCode', 'productName', 'createdDate'] as const)
      .default('id'),
  });
