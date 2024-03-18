import { z } from 'zod';
import type ReceiptInputDto from '../dtos/receipt/receipt-input.dto';
import type ReceiptPaginationDto from '../dtos/receipt/receipt-pagination.dto';
import { paginationSchema } from './pagination.zod';
import {
  numberRequiredMessage,
  requiredFieldMessage,
} from './zod-message-constants';

export const receiptIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .min(1, { message: `Receipt Id ${numberRequiredMessage}` }),
});

export const receiptInputSchema: z.ZodType<ReceiptInputDto> = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, { message: `File Name ${requiredFieldMessage}` }),
  fileExtension: z
    .string()
    .trim()
    .min(1, { message: `File Extension ${requiredFieldMessage}` }),
  filePath: z.string(),
  file: z.any(),
});

export const receiptPaginationSchema: z.ZodType<ReceiptPaginationDto> =
  paginationSchema.extend({
    orderBy: z.enum(['id', 'fileName'] as const).default('id'),
    expenseId: z.string().optional(),
  });
