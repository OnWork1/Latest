import type PaginationInputDto from '../common/pagination-input.dto';
import { type BrandOrderBy } from './brand-order-by.dto';

export default interface BrandPaginationDto extends PaginationInputDto {
  orderBy?: BrandOrderBy;
}
