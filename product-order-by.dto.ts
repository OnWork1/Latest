import { Prisma } from '@prisma/client';

export type ProductOrderBy = keyof Pick<
  Prisma.ProductOrderByWithRelationInput,
  'id' | 'productCode' | 'productName' | 'createdDate'
>;
