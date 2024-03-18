import type PaginationInputDto from '../common/pagination-input.dto';
import { type CostOrderBy } from './cost-order-by.dto';

export default interface CostPaginationDto extends PaginationInputDto {
  orderBy?: CostOrderBy;
}
