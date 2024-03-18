import type { Budget, PaymentType } from '@prisma/client';

export default class BudgetUploadOutputDto {
  constructor(
    public id: number,
    public expenseTitle: string,
    public expenseCode: string | null,
    public dayNumber: number | null,
    public currencyCode: string,
    public paymentType: PaymentType,
    public taxCode: string,
    public salesTaxGroupCode: string,
    public departmentCode: string,
    public productCode: string,
    public isSuccess: boolean,
    public errorMessage: string,
    public rowNumber: number
  ) {}

  static fromEntity(
    data: Budget,
    currencyCode: string,
    taxCode: string,
    departmentCode: string,
    productCode: string,
    isSuccess: boolean,
    errorMessage: string,
    rowNumber: number,
    salesTaxGroupCode: string
  ) {
    return new BudgetUploadOutputDto(
      data.id,
      data.expenseTitle,
      data.expenseCode,
      data.dayNumber,
      currencyCode,
      data.paymentType!,
      taxCode,
      salesTaxGroupCode,
      departmentCode,
      productCode,
      isSuccess,
      errorMessage,
      rowNumber
    );
  }
}
