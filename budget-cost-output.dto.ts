import { type Cost, CostType } from '@prisma/client';

export default class BudgetCostOutputDto {
  constructor(
    public id: number,
    public costType: CostType,
    public costAmount: number,
    public sequence: number,
    public costTypeText: string
  ) {}
  static fromEntity(data: Cost) {
    return new BudgetCostOutputDto(
      data.id,
      data.costType,
      data.costAmount ? data.costAmount.toNumber() : 0,
      data.sequence,
      data.costType == CostType.PERSON ? 'Passenger' : 'Leader'
    );
  }
  static fromEntityArray(data: Cost[]) {
    const budgetCosts: BudgetCostOutputDto[] = [];
    data.forEach((cost) => {
      budgetCosts.push(this.fromEntity(cost));
    });
    return budgetCosts;
  }
}
