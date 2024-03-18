import { type PaymentType } from '@prisma/client';

export interface Budget {
  id?: number;
  expenseTitle: string;
  expenseCode?: string;
  dayNumber?: number;
  expenseCategoryId: number;
  currencyId?: number;
  paymentType?: PaymentType;
  taxCode?: string;
  taxId?: number;
  departmentCode?: string;
  departmentId?: number;
  productCode?: string;
  productId: number;
  noOfPassengers?: number;
  noOfLeaders?: number;
  totalBudget?: string;
  budgetUpload?: File;
  salesTaxGroupCode?: string;
  salesTaxGroupId?: number;
}
