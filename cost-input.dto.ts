import { CostType } from '@prisma/client';

export default interface CostInputDto {
  costType: CostType;
  costAmount: number;
  budgetId: number;
}
