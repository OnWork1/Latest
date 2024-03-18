import type PaginationInputDto from '../common/pagination-input.dto';
import { type TaxOrderBy } from './tax-order-by.dto';

export default interface TaxPaginationDto extends PaginationInputDto {
  orderBy?: TaxOrderBy;
}
