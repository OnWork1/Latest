import { z } from 'zod';
import { paginationSchema } from './pagination.zod';
import type CostInputDto from '../dtos/cost/cost-input.dto';
import type CostPaginationDto from '../dtos/cost/cost-pagination.dto';
import { numberRequiredMessage } from './zod-message-constants';

export const costIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .min(1, { message: `Cost Id ${numberRequiredMessage}` }),
});

export const costInputSchema: z.ZodType<CostInputDto> = z.object({
  costAmount: z.coerce
    .number()
    .min(0, { message: `Cost Amount ${numberRequiredMessage}` }),

  budgetId: z.coerce
    .number()
    .int()
    .min(1, { message: `Budget Id ${numberRequiredMessage}` }),
  costType: z.enum(['PERSON', 'LEADER'] as const),
});

export const costPaginationSchema: z.ZodType<CostPaginationDto> =
  paginationSchema.extend({
    orderBy: z.enum(['id', 'createdDate'] as const).default('id'),
  });
