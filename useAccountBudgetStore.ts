import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type AccountBudget } from '~/interfaces/models/account-budget';
import { type APIResponse } from '~/interfaces/response/api-response';

export const useAccountBudgetStore = defineStore('accountBudgetStore', () => {
  const endpoint = 'account-budgets';
  const accountBudgetList = ref<AccountBudget[] | null>(null);

  const { fetchData } = useFetchData<APIResponse<AccountBudget>>();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();

  const fetchAccountBudgets = async (
    queryParams: string = '',
    fetchAll: boolean = true
  ) => {
    const response = await fetchData(
      endpoint,
      pagination.value.page,
      pagination.value.perPage,
      pagination.value.searchString,
      fetchAll,
      queryParams
    );

    accountBudgetList.value = response.data || [];
  };

  return {
    accountBudgetList,
    fetchAccountBudgets,
    pagination,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});
