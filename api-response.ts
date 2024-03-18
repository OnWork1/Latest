import { type PaginationFilter } from '../common/pagination-filter';

export interface APIResponse<T> {
  id?: number;
  data?: Array<T>;
  pagination?: PaginationFilter;
}
