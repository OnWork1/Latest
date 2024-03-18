import { Prisma } from '@prisma/client';

export type CompanyOrderBy = keyof Pick<
  Prisma.CompanyOrderByWithRelationInput,
  'id' | 'companyCode' | 'companyName' | 'createdDate'
>;
