import type PaginationInputDto from '../common/pagination-input.dto';
import { type BudgetOrderBy } from './budget-order-by.dto';

export default interface BudgetPaginationDto extends PaginationInputDto {
  orderBy?: BudgetOrderBy;
}
