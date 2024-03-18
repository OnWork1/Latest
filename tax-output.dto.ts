import { type Tax } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export default class TaxOutputDto {
  constructor(
    public id: number,
    public taxCode: string,
    public taxRate: Decimal
  ) {}

  static fromEntity(data: Tax | null) {
    if (data) {
      return new TaxOutputDto(data.id, data.taxCode, data.taxRate);
    } else return null;
  }

  static fromEntityArray(data: Tax[]) {
    const taxList: TaxOutputDto[] = [];
    data.forEach((tax) => {
      const taxObj = this.fromEntity(tax);
      if (taxObj) taxList.push(taxObj);
    });
    return taxList;
  }
}
