import { Prisma } from '@prisma/client';

export type UserOrderBy = keyof Pick<
  Prisma.UserOrderByWithRelationInput,
  'id' | 'userAccount' | 'cashCode' | 'cardCode'
>;
