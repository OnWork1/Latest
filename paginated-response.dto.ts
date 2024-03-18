interface PaginationMetaData {
  totalCount: number;
  perPage: number;
  page: number;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  pagination: PaginationMetaData;
}
