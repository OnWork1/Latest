import { Prisma } from '@prisma/client';

export type BusinessOrderBy = keyof Pick<
  Prisma.BusinessOrderByWithRelationInput,
  'id' | 'businessCode' | 'businessName' | 'createdDate'
>;
