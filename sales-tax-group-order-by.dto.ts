import { Prisma } from '@prisma/client';

export type SalesTaxGroupOrderBy = keyof Pick<
  Prisma.SalesTaxGroupOrderByWithRelationInput,
  'id' | 'salesTaxGroupCode' | 'createdDate'
>;
