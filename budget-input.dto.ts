import { PaymentType } from '@prisma/client';

export default interface BudgetInputDto {
  dayNumber?: number | null;
  expenseTitle: string;
  expenseCategoryId: number;
  currencyId?: number | null;
  paymentType?: PaymentType | null;
  taxId?: number | null;
  departmentId?: number | null;
  productId: number;
  salesTaxGroupId?: number | null;
}
