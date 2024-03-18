import { z } from 'zod';

import type UserInputDto from '../dtos/user/user-input.dto';
import type UserPaginationDto from '../dtos/user/user-pagination.dto';
import { paginationSchema } from './pagination.zod';
import {
  numberRequiredMessage,
  requiredFieldMessage,
} from './zod-message-constants';

export const userIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .min(1, { message: `User Id ${numberRequiredMessage}` }),
});

export const userInputSchema: z.ZodType<UserInputDto> = z.object({
  userAccount: z
    .string()
    .email()
    .min(1, { message: `User Account ${requiredFieldMessage}` }),
  cashCode: z
    .string()
    .trim()
    //.min(1, { message: `Cash Code ${requiredFieldMessage}` })
    .optional(),
  cardCode: z
    .string()
    .trim()
    //.min(1, { message: `Card Code ${requiredFieldMessage}` })
    .optional(),
  companyId: z.coerce
    .number()
    .int()
    .min(1, { message: `Company Id ${numberRequiredMessage}` }),
});

export const userPaginationSchema: z.ZodType<UserPaginationDto> =
  paginationSchema.extend({
    orderBy: z.enum(['id', 'userAccount', 'cashCode'] as const).default('id'),
  });
