import { z } from 'zod';

import type AccountBudgetInputDto from '../dtos/account-budget/account-budget-input.dto';
import { requiredFieldMessage } from './zod-message-constants';

export const accountbudgetInputSchema: z.ZodType<AccountBudgetInputDto> =
  z.object({
    accountId: z
      .string()
      .trim()
      .min(1, { message: `Account Id ${requiredFieldMessage}` }),
    productId: z
      .string()
      .trim()
      .min(1, { message: `Product Id ${requiredFieldMessage}` }),
  });
