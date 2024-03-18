import { z } from 'zod';
import type AccountInputDto from '../dtos/account/account-input.dto';
import type AccountPaginationDto from '../dtos/account/account-pagination.dto';
import { paginationSchema } from './pagination.zod';
import {
  numberRequiredMessage,
  optionalStringMessage,
  requiredFieldMessage,
} from './zod-message-constants';

export const accountIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .min(1, { message: `Account Id ${numberRequiredMessage}` }),
});

export const accountInputSchema: z.ZodType<AccountInputDto> = z.object({
  tripCode: z
    .string()
    .trim()
    .min(1, { message: `Trip Code ${requiredFieldMessage}` }),
  productId: z.coerce.number().int().min(1, { message: `Product is required` }),
  accountStatus: z.enum([
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
  ] as const),
  noOfLeaders: z.coerce
    .number()
    .int()
    .min(1, { message: `No. of Leaders ${numberRequiredMessage}` }),
  noOfPassengers: z.coerce
    .number()
    .int()
    .min(1, { message: `No. of Passengers ${numberRequiredMessage}` }),
  departureDate: z
    .string()
    .trim()
    .min(1, { message: `Trip Code ${requiredFieldMessage}` }),
  leaderUserId: z.coerce.number().int().min(1).optional(),
  reviewerNotes: z.optional(
    z
      .string()
      .trim()
      .min(1, { message: `Reviewer notes ${optionalStringMessage}` })
  ),
});

export const accountPaginationSchema: z.ZodType<AccountPaginationDto> =
  paginationSchema.extend({
    orderBy: z.enum(['id', 'tripCode', 'createdDate'] as const).default('id'),
  });
