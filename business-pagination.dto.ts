import type PaginationInputDto from '../common/pagination-input.dto';
import { type BusinessOrderBy } from './business-order-by.dto';

export default interface BusinessPaginationDto extends PaginationInputDto {
  orderBy?: BusinessOrderBy;
}
