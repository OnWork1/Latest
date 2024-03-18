import type PaginationInputDto from '../common/pagination-input.dto';
import { type CurrencyOrderBy } from './currency-order-by.dto';

export default interface CurrencyPaginationDto extends PaginationInputDto {
  orderBy?: CurrencyOrderBy;
}
