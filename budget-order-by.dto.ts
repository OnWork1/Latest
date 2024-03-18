import { Prisma } from '@prisma/client';

export type BudgetOrderBy = keyof Pick<
  Prisma.BudgetOrderByWithRelationInput,
  'id' | 'expenseTitle' | 'expenseCode' | 'createdDate'
>;
