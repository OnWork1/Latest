import { z } from 'zod';
import type PaginationInputDto from '../dtos/common/pagination-input.dto';

export const paginationSchema = z.object({
  searchQuery: z
    .string()
    .optional()
    .transform((x) => x ?? ''),
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).optional(),
  orderDirection: z.enum(['asc', 'desc'] as const).default('asc'),
}) satisfies z.ZodType<PaginationInputDto>;
