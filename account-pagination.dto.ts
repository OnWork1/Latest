import type PaginationInputDto from '../common/pagination-input.dto';
import { type AccountOrderBy } from './account-order-by.dto';

export default interface AccountPaginationDto extends PaginationInputDto {
  orderBy?: AccountOrderBy;
}
