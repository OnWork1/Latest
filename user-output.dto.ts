import { type Company, type User } from '@prisma/client';

export default class UserOutputDto {
  constructor(
    public id: number,
    public userAccount: string,
    public cardCode: string,
    public cashCode: string,
    public isActive: boolean,
    public companyId: number,
    public companyCode: string
  ) {}

  static fromEntity(data: User, company: Company) {
    return new UserOutputDto(
      data.id,
      data.userAccount,
      data.cardCode ?? '',
      data.cashCode ?? '',
      data.isActive,
      data.companyId,
      company.companyCode
    );
  }
}
