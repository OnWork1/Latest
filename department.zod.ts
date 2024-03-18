import { z } from 'zod';
import { paginationSchema } from './pagination.zod';
import type DepartmentInputDto from '../dtos/department/department-input.dto';
import type DepartmentPaginationDto from '../dtos/department/department-pagination.dto';
import {
  numberRequiredMessage,
  requiredFieldMessage,
} from './zod-message-constants';

export const departmentIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .min(1, { message: `Department Id ${numberRequiredMessage}` }),
});

export const departmentInputSchema: z.ZodType<DepartmentInputDto> = z.object({
  departmentCode: z
    .string()
    .trim()
    .min(1, { message: `Department Code ${requiredFieldMessage}` }),
  departmentName: z
    .string()
    .trim()
    .min(1, { message: `Department Name ${requiredFieldMessage}` }),
});

export const departmentPaginationSchema: z.ZodType<DepartmentPaginationDto> =
  paginationSchema.extend({
    orderBy: z
      .enum(['id', 'departmentCode', 'departmentName', 'createdDate'] as const)
      .default('id'),
  });
