import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Business } from '~/interfaces/models/business';
import { type APIResponse } from '~/interfaces/response/api-response';

export const useBusinessStore = defineStore('businessStore', () => {
  const endpoint = 'businesses';
  const isOperationSuccessful = ref<boolean>(false);
  const businessesList = ref<Business[] | null>(null);

  const { fetchData } = useFetchData<APIResponse<Business>>();
  const { updateData } = useUpdateData();
  const { createData } = useCreateData<APIResponse<Business>>();
  const { deleteData } = useDeleteData();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();

  const fetchBusinesses = async (fetchAll: boolean = false) => {
    const response = await fetchData(
      endpoint,
      pagination.value.page,
      pagination.value.perPage,
      pagination.value.searchString,
      fetchAll
    );

    businessesList.value = response.data || [];
    setPaginationDetails(
      pagination.value.searchString,
      response.pagination?.page,
      response.pagination?.perPage,
      response.pagination?.totalCount
    );
  };

  const createNewBusiness = async (businessDetails: Business) => {
    const response = await createData(endpoint, businessDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchBusinesses();
  };

  const updateBusiness = async (businessDetails: Business) => {
    const response = await updateData(endpoint, businessDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchBusinesses();
  };

  const deleteBusiness = async (businessId: number) => {
    await deleteData(endpoint, businessId);
    await fetchBusinesses();
  };

  return {
    isOperationSuccessful,
    businessesList,
    deleteBusiness,
    updateBusiness,
    createNewBusiness,
    fetchBusinesses,
    pagination,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});
