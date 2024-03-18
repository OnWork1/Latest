import type PaginationInputDto from '../common/pagination-input.dto';
import { type ReceiptOrderBy } from './receipt-order-by.dto';

export default interface ReceiptPaginationDto extends PaginationInputDto {
  orderBy?: ReceiptOrderBy;
  expenseId?: string;
}
