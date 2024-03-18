import { Prisma } from '@prisma/client';

export type DepartmentOrderBy = keyof Pick<
  Prisma.DepartmentOrderByWithRelationInput,
  'id' | 'departmentCode' | 'departmentName' | 'createdDate'
>;
