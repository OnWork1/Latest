import type PaginationInputDto from '../common/pagination-input.dto';
import { type CompanyOrderBy } from './company-order-by.dto';

export default interface CompanyPaginationDto extends PaginationInputDto {
  orderBy?: CompanyOrderBy;
}
