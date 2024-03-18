import { z } from 'zod';
import type BudgetCostInputDto from '../dtos/budget-cost/budget-cost-input.dto';
import { requiredFieldMessage } from './zod-message-constants';

export const budgetCostInputSchema: z.ZodType<BudgetCostInputDto> = z.object({
  budgetId: z
    .string()
    .trim()
    .min(1, { message: `Budget Id ${requiredFieldMessage}` }),
});
