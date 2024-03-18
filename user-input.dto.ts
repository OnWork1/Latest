export default interface UserInputDto {
  userAccount: string;
  cardCode?: string;
  cashCode?: string;
  isActive?: boolean;
  companyId: number;
}
