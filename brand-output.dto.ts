import { type Brand } from '@prisma/client';

export default class BrandOutputDto {
  constructor(
    public id: number,

    public brandName: string
  ) {}

  static fromEntity(data: Brand) {
    return new BrandOutputDto(data.id, data.brandName);
  }

  static fromEntityArray(data: Brand[]) {
    const brandList: BrandOutputDto[] = [];
    data.forEach((brand) => {
      brandList.push(this.fromEntity(brand));
    });
    return brandList;
  }
}
