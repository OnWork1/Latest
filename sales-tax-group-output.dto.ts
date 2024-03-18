import { type SalesTaxGroup } from '@prisma/client';

export default class SalesTaxGroupOutputDto {
  constructor(
    public id: number,
    public salesTaxGroupCode: string
  ) {}

  static fromEntity(data: SalesTaxGroup) {
    if (data) {
      return new SalesTaxGroupOutputDto(data.id, data.salesTaxGroupCode);
    } else return null;
  }

  static fromEntityArray(data: SalesTaxGroup[]) {
    const salesTaxGroupList: SalesTaxGroupOutputDto[] = [];
    data.forEach((currency) => {
      const salesTaxGroupObj = this.fromEntity(currency);
      if (salesTaxGroupObj) salesTaxGroupList.push(salesTaxGroupObj);
    });
    return salesTaxGroupList;
  }
}
