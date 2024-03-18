import type { Cost, CostType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export default class CostOutputDto {
  constructor(
    public id: number,
    public costType: CostType,
    public costAmount: Decimal | null,
    public sequence: number
  ) {}

  static fromEntity(data: Cost) {
    return new CostOutputDto(
      data.id,
      data.costType,
      data.costAmount,
      data.sequence
    );
  }
}
