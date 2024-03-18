import { z } from 'zod';
import type ProductBudgetInputDto from '../dtos/product-budget/product-budget-input.dto';
import { requiredFieldMessage } from './zod-message-constants';

export const productBudgetInputSchema: z.ZodType<ProductBudgetInputDto> =
  z.object({
    productId: z
      .string()
      .trim()
      .min(1, { message: `Product Id ${requiredFieldMessage}` }),
  });
