import {
  type ExpenseStatus,
  type ExpenseType,
  type PaymentType,
} from '@prisma/client';

export interface AccountBudget {
  expenseId: number;
  expenseTitle: string;
  date: string;
  budgetedNoOfPassengers: number | null;
  budgetedNoOfLeaders: number | null;
  budgetedAmount: number;
  budgetedBaseCurrencyAmount: number;
  budgetCurrency: string;
  accountNoOfPassengers: number | null;
  accountNoOfLeaders: number | null;
  accountCurrency: string;
  actualAmount: number | null;
  actualBaseCurrencyAmount: number | null;
  expenseCode: string;
  paymentType: PaymentType | null;
  taxCode: string;
  departmentCode: string;
  expenseType: ExpenseType | null;
  expenseStatus: ExpenseStatus | null;
  attachmentCount: number;
}
