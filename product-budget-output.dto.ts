import { PaymentType, Prisma } from '@prisma/client';

export default interface AccountBudgetOutputDto {
  expenseTitle: string | undefined;
  date: string | undefined;
  budgetedNoOfPassengers: number | undefined;
  budgetedNoOfLeaders: number | undefined;
  budgetedAmount: Prisma.Decimal;
  budgetCurrency: string | undefined;
  accountNoOfPassengers: number | undefined;
  accountNoOfLeaders: number | undefined;
  expenseCode: string | undefined;
  paymentType: PaymentType;
  taxCode: string | undefined;
  departmentCode: string | undefined;
}
/*


Expense Title

Product.Budget.ExpenseTitle

Date

Product.Budget.DayNumber + Account.DepartureDate

Number of Passengers

Account.NumberPassengers

Number of Leaders

Account.NumberLeaders

Budget Amount

Product.Budget.CostPerson[Account.NumberPassengers] + Product.Budget.CostLeader[Account.NumberLeaders]

Budget Currency

Product.Budget.CurrencyCode

Expense Category

Product.Budget.ExpenseCode

Payment Type

Product.Budget.PaymentType

Tax Code

Product.Budget.TaxCode

Department Code


*/
