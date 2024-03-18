import type PaginationInputDto from '../common/pagination-input.dto';
import { type SalesTaxGroupOrderBy } from './sales-tax-group-order-by.dto';

export default interface SalesTaxGroupPaginationDto extends PaginationInputDto {
  orderBy?: SalesTaxGroupOrderBy;
}
