import { type PaginationFilter } from '~/interfaces/common/pagination-filter';

export const usePagination = () => {
  const pagination = ref<PaginationFilter>(defaultPaginationValues);

  const setPaginationDetails = (
    searchString: string = pagination.value.searchString,
    page: number = pagination.value.page,
    perPage: number = pagination.value.perPage,
    totalCount: number = pagination.value.totalCount || 0
  ) => {
    pagination.value = { page, perPage, totalCount, searchString };
  };

  const clearFiltersAndParameters = () => {
    setPaginationDetails(
      defaultPaginationValues.searchString,
      defaultPaginationValues.page,
      defaultPaginationValues.perPage,
      defaultPaginationValues.totalCount
    );
  };

  return { pagination, setPaginationDetails, clearFiltersAndParameters };
};
