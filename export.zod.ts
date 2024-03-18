import { z } from 'zod';
import type AccountExportInputDto from '../dtos/export/account-export-input.dto';
import { numberRequiredMessage } from './zod-message-constants';

export const exportAccountInputSchema: z.ZodType<AccountExportInputDto> =
  z.object({
    id: z.coerce
      .number()
      .int()
      .min(1, { message: `Account Id ${numberRequiredMessage}` }),
    transactionDate: z.coerce.date(),
    documentDate: z.coerce.date(),
  });
