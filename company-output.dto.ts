import { type Currency, type Company } from '@prisma/client';

export default class CompanyOutputDto {
  constructor(
    public id: number,
    public companyCode: string,
    public companyName: string,
    public baseCurrencyId: number | null,
    public baseCurrencyCode: string | null
  ) {}

  static fromEntity(data: Company, baseCurrency: Currency) {
    return new CompanyOutputDto(
      data.id,
      data.companyCode,
      data.companyName,
      data.baseCurrencyId,
      baseCurrency.currencyCode
    );
  }

  // static fromEntityArray(data: Company[]) {
  //   const companyList: CompanyOutputDto[] = [];
  //   data.forEach((company) => {
  //     companyList.push(this.fromEntity(company));
  //   });
  //   return companyList;
  // }
}
