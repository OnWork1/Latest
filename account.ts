import { AccountStatus } from '@prisma/client';

export interface Account {
  id?: number;
  tripCode: string;
  noOfPassengers: number;
  productId: number;
  noOfLeaders: number;
  accountStatus: AccountStatus;
  departureDate: string;
  totalBudget?: number;
  totalExpenses?: number;
  reviewerNotes?: string;
  leaderUserId?: number;
  leader?: string;
  baseCurrencyCode?: string;
  finishDate?: string;
  cacheId?: number;
}
