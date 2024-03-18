import { Prisma } from '@prisma/client';

export default interface CashDetail {
  currencyCode: string;
  availableBalance: Prisma.Decimal;
}
