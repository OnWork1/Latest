import {
  type Currency,
  type Department,
  type Expense,
  type ExpenseCategory,
  ExpenseType,
  PaymentType,
  Prisma,
  type Tax,
  ExpenseStatus,
} from '@prisma/client';

export default class AccountBudgetOutputDto {
  constructor(
    public expenseTitle: string,
    public date: string,
    public budgetedAmount: Prisma.Decimal | null,
    public budgetedBaseCurrencyAmount: Prisma.Decimal | null,
    public budgetCurrency: string,
    public accountCurrency: string,
    public actualAmount: Prisma.Decimal | null,
    public actualBaseCurrencyAmount: Prisma.Decimal | null,
    public expenseCode: string,
    public paymentType: PaymentType | null,
    public taxCode: string,
    public departmentCode: string,
    public expenseType: ExpenseType | null,
    public expenseStatus: ExpenseStatus | null,
    public attachmentCount: number,
    public comment: string | null,
    public expenseId: number
  ) {}

  static fromEntity(
    expense: Expense,
    currency: Currency,
    department: Department,
    expenseCategory: ExpenseCategory,
    tax: Tax,
    budgetedCurrency: Currency,
    receiptCount: number
  ) {
    return new AccountBudgetOutputDto(
      expense.expenseTitle,
      expense.expenseDate.toISOString(),

      Prisma.Decimal.add(
        expense.budgetedLeaderCost ?? 0,
        expense.budgetedPassengerCost ?? 0
      ).toDP(2),
      Prisma.Decimal.add(
        expense.budgetedBaseCurrencyLeaderCost ?? 0,
        expense.budgetedBaseCurrencyPassengerCost ?? 0
      ).toDP(2),
      budgetedCurrency ? budgetedCurrency.currencyCode : '',

      currency
        ? currency.currencyCode
        : budgetedCurrency
          ? budgetedCurrency.currencyCode
          : '',
      expense.amount ? expense.amount.toDP(2) : new Prisma.Decimal(0.0).toDP(2),
      expense.baseCurrencyAmount
        ? expense.baseCurrencyAmount.toDP(2)
        : new Prisma.Decimal(0.0).toDP(2),
      expenseCategory ? expenseCategory.expenseCode : '',
      expense.paymentType,
      tax ? tax.taxCode : '',
      department ? department.departmentCode : '',
      expense.expenseType ? expense.expenseType : null,
      expense.status,
      receiptCount,
      expense.comment,
      expense.id
    );
  }
}
