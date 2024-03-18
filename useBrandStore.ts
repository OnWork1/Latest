import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Brand } from '~/interfaces/models/brand';
import { type APIResponse } from '~/interfaces/response/api-response';

export const useBrandStore = defineStore('brandStore', () => {
  const endpoint = 'brands';
  const isOperationSuccessful = ref<boolean>(false);
  const brandsList = ref<Brand[] | null>(null);

  const { fetchData } = useFetchData<APIResponse<Brand>>();
  const { updateData } = useUpdateData();
  const { createData } = useCreateData<APIResponse<Brand>>();
  const { deleteData } = useDeleteData();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();

  const fetchBrands = async (fetchAll: boolean = false) => {
    const response = await fetchData(
      endpoint,
      pagination.value.page,
      pagination.value.perPage,
      pagination.value.searchString,
      fetchAll
    );

    brandsList.value = response.data || [];
    setPaginationDetails(
      pagination.value.searchString,
      response.pagination?.page,
      response.pagination?.perPage,
      response.pagination?.totalCount
    );
  };

  const createNewBrand = async (brandDetails: Brand) => {
    const response = await createData(endpoint, brandDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchBrands();
  };

  const updateBrand = async (brandDetails: Brand) => {
    const response = await updateData(endpoint, brandDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchBrands();
  };

  const deleteBrand = async (brandId: number) => {
    await deleteData(endpoint, brandId);
    await fetchBrands();
  };

  return {
    isOperationSuccessful,
    brandsList,
    deleteBrand,
    updateBrand,
    createNewBrand,
    fetchBrands,
    pagination,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});
