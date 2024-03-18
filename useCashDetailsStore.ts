import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type CashDetail } from '~/interfaces/models/cash-details';
import { type APIResponse } from '~/interfaces/response/api-response';

export const useCashDetailsStore = defineStore('cashDetailsStore', () => {
  const endpoint = 'cash-details';
  const cashDetails = ref<CashDetail[] | null>(null);

  const { fetchData } = useFetchData<APIResponse<CashDetail>>();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();

  const fetchCashDetails = async (fetchAll: boolean = false) => {
    const response = await fetchData(
      endpoint,
      pagination.value.page,
      pagination.value.perPage,
      pagination.value.searchString,
      fetchAll
    );

    cashDetails.value = response.data || [];
    setPaginationDetails(
      pagination.value.searchString,
      response.pagination?.page,
      response.pagination?.perPage,
      response.pagination?.totalCount
    );
  };

  return {
    cashDetails,
    fetchCashDetails,
    pagination,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});
