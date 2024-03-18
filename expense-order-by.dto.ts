import { Prisma } from '@prisma/client';

export type ExpenseOrderBy = keyof Pick<
  Prisma.ExpenseOrderByWithRelationInput,
  'id' | 'expenseTitle'
>;
