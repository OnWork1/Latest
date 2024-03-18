import { Prisma } from '@prisma/client';

export type ExpenseCategoryOrderBy = keyof Pick<
  Prisma.ExpenseCategoryOrderByWithRelationInput,
  | 'id'
  | 'expenseCode'
  | 'expenseName'
  | 'defaultPaymentType'
  | 'disablePaymentType'
  | 'createdDate'
>;
