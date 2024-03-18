import type PaginationInputDto from '../common/pagination-input.dto';
import { type ProductOrderBy } from './product-order-by.dto';

export default interface ProductPaginationDto extends PaginationInputDto {
  orderBy?: ProductOrderBy;
}
