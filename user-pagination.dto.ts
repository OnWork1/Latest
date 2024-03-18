import type PaginationInputDto from '../common/pagination-input.dto';
import { type UserOrderBy } from './user-order-by.dto';

export default interface UserPaginationDto extends PaginationInputDto {
  orderBy?: UserOrderBy;
}
