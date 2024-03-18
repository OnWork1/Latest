import type PaginationInputDto from '../common/pagination-input.dto';
import { type ExpenseOrderBy } from './expense-order-by.dto';

export default interface ExpensePaginationDto extends PaginationInputDto {
  orderBy?: ExpenseOrderBy;
  accountId: string;
}
