import { Prisma } from '@prisma/client';

export type CostOrderBy = keyof Pick<
  Prisma.CostOrderByWithRelationInput,
  'id' | 'createdDate'
>;
