import type PaginationInputDto from '../common/pagination-input.dto';
import { type ExpenseCategoryOrderBy } from './expense-category-order-by.dto';

export default interface ExpenseCategoryPaginationDto
  extends PaginationInputDto {
  orderBy?: ExpenseCategoryOrderBy;
}
