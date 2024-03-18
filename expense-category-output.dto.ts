import { type ExpenseCategory, PaymentType } from '@prisma/client';

export default class ExpenseCategoryOutputDto {
  constructor(
    public id: number,
    public expenseName: string,
    public expenseCode: string,
    public defaultPaymentType: PaymentType,
    public disablePaymentType: boolean
  ) {}

  static fromEntity(data: ExpenseCategory) {
    return new ExpenseCategoryOutputDto(
      data.id,
      data.expenseName,
      data.expenseCode,
      data.defaultPaymentType,
      data.disablePaymentType
    );
  }

  static fromEntityArray(data: ExpenseCategory[]) {
    const expenseCategoryList: ExpenseCategoryOutputDto[] = [];
    data.forEach((expenseCategory) => {
      expenseCategoryList.push(this.fromEntity(expenseCategory));
    });
    return expenseCategoryList;
  }
}
