import {
  type Currency,
  type Department,
  type Expense,
  type ExpenseCategory,
  PaymentType,
  Prisma,
  type Tax,
  type ExpenseTransactionType,
  type ExpenseType,
} from '@prisma/client';

export default class ExpenseOutputDto {
  constructor(
    public id: number,
    public expenseTitle: string,
    public expenseDate: Date,
    public noOfPassengers: number | null,
    public noOfLeaders: number | null,
    public accountId: number,
    public currencyId: number | null,
    public currencyCode: string | null,
    public expenseCategoryId: number | null,
    public expenseCategory: string | null,
    public paymentType: PaymentType | null,
    public comment: string | null,
    public taxId: number | null,
    public taxCode: string | null,
    public invoiceNumber: string | null,
    public departmentId: number | null,
    public departmentCode: string | null,
    public status: string,
    public isActive: boolean,
    public amount: Prisma.Decimal | null,
    public receiptCount: number | null,
    public budgetedNoOfPax: number | null,
    public budgetedNoOfLeaders: number | null,
    public budgetedLeaderCost: Prisma.Decimal | null,
    public budgetedPassengerCost: Prisma.Decimal | null,
    public budgetedCurrencyId: number | null,
    public budgetedCurrencyCode: string | null,
    public budgetedAmount: Prisma.Decimal | null,
    public expenseTransactionType: ExpenseTransactionType,
    public salesTaxGroupId: number | null,
    public expenseType: ExpenseType | null
  ) {}

  static fromEntity(
    data: Expense,
    currency: Currency | null,
    department: Department,
    expenseCat: ExpenseCategory,
    tax: Tax,
    receiptCount: number,
    budgetedCurrency: Currency | null
  ) {
    return new ExpenseOutputDto(
      data.id,
      data.expenseTitle,
      data.expenseDate,
      data.noOfPassengers ?? 0,
      data.noOfLeaders ?? 0,
      data.accountId,
      data.currencyId ? data.currencyId : budgetedCurrency?.id ?? 0,
      currency ? currency.currencyCode : budgetedCurrency?.currencyCode ?? '',
      data.expenseCategoryId,
      expenseCat ? expenseCat.expenseCode : '',
      data.paymentType,
      data.comment,
      data.taxId,
      tax ? tax.taxCode : '',
      data.invoiceNumber,
      data.departmentId,
      department ? department.departmentCode : '',
      data.status,
      data.isActive,
      data.amount == new Prisma.Decimal(0)
        ? Prisma.Decimal.add(
            data.budgetedLeaderCost ?? new Prisma.Decimal(0),
            data.budgetedPassengerCost ?? new Prisma.Decimal(0)
          )
        : data.amount,
      receiptCount,
      data.budgetedNoOfPax,
      data.budgetedNoOfLeaders,
      data.budgetedLeaderCost,
      data.budgetedPassengerCost,
      budgetedCurrency ? budgetedCurrency.id : null,
      budgetedCurrency ? budgetedCurrency.currencyCode : null,
      Prisma.Decimal.add(
        data.budgetedLeaderCost ?? new Prisma.Decimal(0),
        data.budgetedPassengerCost ?? new Prisma.Decimal(0)
      ),
      data.expenseTransactionType,
      data.salesTaxGroupId,
      data.expenseType
    );
  }

  // static fromEntityArray(data: Expense[]) {
  //   const brandList: ExpenseOutputDto[] = [];
  //   data.forEach((brand) => {
  //     brandList.push(this.fromEntity(brand));
  //   });
  //   return brandList;
  // }
}
