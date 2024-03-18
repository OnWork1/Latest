import { z } from 'zod';
import { paginationSchema } from './pagination.zod';
import type CompanyInputDto from '../dtos/company/company-input.dto';
import type CompanyPaginationDto from '../dtos/company/company-pagination.dto';
import {
  numberRequiredMessage,
  requiredFieldMessage,
} from './zod-message-constants';

export const companyIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .min(1, { message: `Company Id ${numberRequiredMessage}` }),
});

export const companyInputSchema: z.ZodType<CompanyInputDto> = z.object({
  companyCode: z
    .string()
    .trim()
    .min(1, { message: `Company Code ${requiredFieldMessage}` }),
  companyName: z
    .string()
    .trim()
    .min(1, { message: `Company Name ${requiredFieldMessage}` }),
  baseCurrencyId: z.coerce
    .number()
    .min(1, { message: `Base Currency ${requiredFieldMessage}` }),
});

export const companyPaginationSchema: z.ZodType<CompanyPaginationDto> =
  paginationSchema.extend({
    orderBy: z
      .enum(['id', 'companyCode', 'companyName', 'createdDate'] as const)
      .default('id'),
  });
