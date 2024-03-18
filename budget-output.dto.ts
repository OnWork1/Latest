import type {
  Currency,
  Department,
  PaymentType,
  Product,
  Tax,
  Budget,
  Prisma,
  ExpenseCategory,
  SalesTaxGroup,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export default class BudgetOutputDto {
  constructor(
    public id: number,
    public expenseTitle: string,
    public expenseCode: string | null,
    public dayNumber: number | null,
    public currencyCode: string | null,
    public currencyId: number | null,
    public paymentType: PaymentType,
    public taxCode: string | null,
    public taxId: number | null,
    public departmentCode: string | null,
    public departmentId: number | null,
    public productCode: string,
    public productId: number,
    public noOfPassengers: number | null,
    public noOfLeaders: number | null,
    public totalBudget: Decimal | null,
    public expenseCategoryId: number,
    public salesTaxGroupCode: string | null,
    public salesTaxGroupId: number | null
  ) {}

  static fromEntity(
    data: Budget,
    currency: Currency,
    tax: Tax,
    department: Department,
    product: Product,
    noOfPassengers: number,
    noOfLeaders: number,
    totalBudget: Prisma.Decimal,
    expenseCategory: ExpenseCategory,
    salesTaxGroup: SalesTaxGroup
  ) {
    return new BudgetOutputDto(
      data.id,
      data.expenseTitle,
      data.expenseCode,
      data.dayNumber,
      currency ? currency.currencyCode : '',
      currency ? currency.id : null,
      data.paymentType!,
      tax ? tax.taxCode : '',
      tax ? tax.id : null,
      department ? department.departmentCode : '',
      department ? department.id : null,
      product ? product.productCode : '',
      product ? product.id : 0,
      noOfPassengers,
      noOfLeaders,
      totalBudget,
      expenseCategory ? expenseCategory.id : 0,
      salesTaxGroup ? salesTaxGroup.salesTaxGroupCode : '',
      salesTaxGroup ? salesTaxGroup.id : null
    );
  }
}
