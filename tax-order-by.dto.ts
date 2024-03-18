import { Prisma } from '@prisma/client';

export type TaxOrderBy = keyof Pick<
  Prisma.TaxOrderByWithRelationInput,
  'id' | 'taxCode' | 'createdDate'
>;
