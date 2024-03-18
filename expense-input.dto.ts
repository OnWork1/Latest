import { ExpenseStatus, ExpenseType, PaymentType } from '@prisma/client';
import type ReceiptInputDto from '../receipt/receipt-input.dto';

export default interface ExpenseInputDto {
  expenseId?: number;
  expenseTitle: string;
  expenseDate: string;
  noOfPassengers?: number | null;
  noOfLeaders?: number | null;
  accountId: number;
  currencyId?: number | null;
  expenseCategoryId?: number | null;
  paymentType?: PaymentType | null;
  comment?: string | null;
  taxId?: number | null;
  invoiceNumber?: string | null;
  departmentId?: number | null;
  status: ExpenseStatus;
  amount?: number | null;
  receipts?: ReceiptInputDto[];
  expenseType?: ExpenseType | null;
  salesTaxGroupId?: number | null;
}
