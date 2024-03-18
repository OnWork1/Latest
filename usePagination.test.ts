import { describe, it, expect } from 'vitest';
import { usePagination } from '~/composables/usePagination';
import { type PaginationFilter } from '~/interfaces/common/pagination-filter';

describe('usePagination', () => {
  it('should initialize pagination with default values', () => {
    const { pagination } = usePagination();
    const defaultPaginationValues: PaginationFilter = {
      searchString: '',
      page: 1,
      perPage: 5,
      totalCount: 0,
    };

    expect(pagination.value).toEqual(defaultPaginationValues);
  });

  it('should update pagination details', () => {
    const { pagination, setPaginationDetails } = usePagination();
    const newPaginationValues: PaginationFilter = {
      searchString: 'test',
      page: 2,
      perPage: 20,
      totalCount: 100,
    };

    setPaginationDetails(
      newPaginationValues.searchString,
      newPaginationValues.page,
      newPaginationValues.perPage,
      newPaginationValues.totalCount
    );

    expect(pagination.value).toEqual(newPaginationValues);
  });

  it('should clear filters and parameters', () => {
    const { pagination, clearFiltersAndParameters } = usePagination();
    const defaultPaginationValues: PaginationFilter = {
      page: 1,
      perPage: 5,
      totalCount: 0,
      searchString: '',
    };

    pagination.value = {
      searchString: 'test',
      page: 2,
      perPage: 20,
      totalCount: 100,
    };

    clearFiltersAndParameters();

    expect(pagination.value).toEqual(defaultPaginationValues);
  });
});
