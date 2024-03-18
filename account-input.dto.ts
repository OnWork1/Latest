import { AccountStatus } from '@prisma/client';

export default interface AccountInputDto {
  tripCode: string;
  noOfPassengers: number;
  productId: number;
  noOfLeaders: number;
  accountStatus: AccountStatus;
  departureDate: string;
  reviewerNotes?: string;
  leaderUserId?: number;
}
