import type PaginationInputDto from '../common/pagination-input.dto';
import { type DepartmentOrderBy } from './department-order-by.dto';

export default interface DepartmentPaginationDto extends PaginationInputDto {
  orderBy?: DepartmentOrderBy;
}
