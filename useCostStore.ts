import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Cost } from '~/interfaces/models/cost';
import { type APIResponse } from '~/interfaces/response/api-response';

export const useCostStore = defineStore('costStore', () => {
  const endpoint = 'costs';
  const isOperationSuccessful = ref<boolean>(false);
  const costList = ref<Cost[] | null>(null);

  const { fetchData } = useFetchData<APIResponse<Cost>>();
  const { updateData } = useUpdateData();
  const { createData } = useCreateData<APIResponse<Cost>>();
  const { deleteData } = useDeleteData();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();

  const fetchCosts = async () => {
    const response = await fetchData(
      endpoint,
      pagination.value.page,
      pagination.value.perPage,
      pagination.value.searchString
    );

    costList.value = response.data || [];
    setPaginationDetails(
      pagination.value.searchString,
      response.pagination?.page,
      response.pagination?.perPage,
      response.pagination?.totalCount
    );
  };

  const createNewCost = async (costDetails: Cost) => {
    const response = await createData(endpoint, costDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchCosts();
  };

  const updateCost = async (costDetails: Cost) => {
    const response = await updateData(endpoint, costDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchCosts();
  };

  const deleteCost = async (costId: number) => {
    await deleteData(endpoint, costId);
    await fetchCosts();
  };

  return {
    isOperationSuccessful,
    costList,
    deleteCost,
    updateCost,
    createNewCost,
    fetchCosts,
    pagination,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});
