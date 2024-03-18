import { Prisma } from '@prisma/client';

export type AccountOrderBy = keyof Pick<
  Prisma.AccountOrderByWithRelationInput,
  'id' | 'tripCode' | 'createdDate' | 'updatedDate'
>;
