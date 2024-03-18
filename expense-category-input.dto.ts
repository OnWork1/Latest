import { PaymentType } from '@prisma/client';

export default interface ExpenseCategoryInputDto {
  expenseName: string;
  expenseCode: string;
  defaultPaymentType: PaymentType;
  disablePaymentType: boolean;
}
