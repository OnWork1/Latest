import { PaymentType } from '@prisma/client';

export interface ProductBudget {
  id?: number;
  expenseTitle: string;
  expenseCode: string;
  dayNumber: number;
  currencyCode: string;
  currencyId: number;
  paymentType: PaymentType;
  taxCode: string;
  taxId: number;
  departmentCode: string;
  departmentId: number;
  productCode: string;
  productId: number;
  noOfPassengers: number;
  noOfLeaders: number;
  totalBudget: string;
}
