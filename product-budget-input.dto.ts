import { type BudgetOrderBy } from '../budget/budget-order-by.dto';
import type PaginationInputDto from '../common/pagination-input.dto';

export default interface ProductBudgetInputDto extends PaginationInputDto {
  productId: string;
  searchQuery?: string;
  orderBy?: BudgetOrderBy;
}
