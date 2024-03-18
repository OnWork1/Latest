import { type Currency } from '@prisma/client';

export default class CurrencyOutputDto {
  constructor(
    public id: number,
    public currencyCode: string,
    public currencyName: string,
    public currencyRate: number
  ) {}

  static fromEntity(data: Currency) {
    if (data) {
      return new CurrencyOutputDto(
        data.id,
        data.currencyCode,
        data.currencyName,
        data.currencyRate
      );
    } else return null;
  }

  static fromEntityArray(data: Currency[]) {
    const currencyList: CurrencyOutputDto[] = [];
    data.forEach((currency) => {
      const currencyObj = this.fromEntity(currency);
      if (currencyObj) currencyList.push(currencyObj);
    });
    return currencyList;
  }
}
