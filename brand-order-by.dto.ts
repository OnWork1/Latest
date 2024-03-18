import { Prisma } from '@prisma/client';

export type BrandOrderBy = keyof Pick<
  Prisma.BrandOrderByWithRelationInput,
  'id' | 'brandName' | 'createdDate'
>;
