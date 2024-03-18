import { type PaymentType } from '@prisma/client';

export interface ExpenseCategory {
  id?: number;
  expenseName: string;
  expenseCode: string;
  defaultPaymentType: PaymentType;
  disablePaymentType: boolean;
}
