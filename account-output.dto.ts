import type {
  Account,
  AccountStatus,
  Currency,
  Product,
  User,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export default class AccountOutputDto {
  constructor(
    public id: number,
    public accountStatus: AccountStatus,
    public tripCode: string,
    public noOfLeaders: number,
    public noOfPassengers: number,
    public productCode: string,
    public productId: number,
    public departureDate: string,
    public totalBudget: Decimal,
    public totalExpenses: Decimal,
    public reviewerNotes: string | null,
    public leaderUserId: number | null,
    public leader: string | null,
    public baseCurrencyCode: string | null,
    public finishDate: string
  ) {}

  static fromEntity(
    data: Account,
    product: Product,
    totalBudget: Decimal,
    totalExpenses: Decimal,
    leader: User | null,
    baseCurrency: Currency | null
  ) {
    let finishDate: string = '';

    //LAA-106
    if (data.departureDate) {
      const departureDate = new Date(data.departureDate!);
      departureDate.setDate(
        departureDate.getDate() + (+product!.duration! - 1)
      );

      finishDate = departureDate.toString();
    }

    return new AccountOutputDto(
      data.id,
      data.accountStatus,
      data.tripCode,
      data.noOfLeaders,
      data.noOfPassengers,
      product.productCode,
      product.id,
      data.departureDate.toString(),
      totalBudget,
      totalExpenses,
      data.reviewerNotes,
      data.leaderUserId,
      leader ? leader.userAccount : '',
      baseCurrency ? baseCurrency.currencyCode : '',
      finishDate
    );
  }
}
