import { type AccountOrderBy } from '../account/account-order-by.dto';
import type PaginationInputDto from '../common/pagination-input.dto';

export default interface AccountBudgetInputDto extends PaginationInputDto {
  accountId: string;
  productId: string;
  orderBy?: AccountOrderBy;
}
