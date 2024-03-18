import { type Business } from '@prisma/client';

export default class BusinessOutputDto {
  constructor(
    public id: number,
    public businessCode: string,
    public businessName: string | null
  ) {}

  static fromEntity(data: Business) {
    return new BusinessOutputDto(data.id, data.businessCode, data.businessName);
  }

  static fromEntityArray(data: Business[]) {
    const businessList: BusinessOutputDto[] = [];
    data.forEach((company) => {
      businessList.push(this.fromEntity(company));
    });
    return businessList;
  }
}
