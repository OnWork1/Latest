import { Prisma } from '@prisma/client';

export type CurrencyOrderBy = keyof Pick<
  Prisma.CurrencyOrderByWithRelationInput,
  'id' | 'currencyCode' | 'currencyName' | 'createdDate'
>;
