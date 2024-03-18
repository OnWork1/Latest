import { Prisma } from '@prisma/client';

export type ReceiptOrderBy = keyof Pick<
  Prisma.ReceiptInfoOrderByWithRelationInput,
  'id' | 'fileName'
>;
