import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Tax } from '~/interfaces/models/tax';
import { useOfflineStore } from '~/stores/useOfflineStore';
import { type APIResponse } from '~/interfaces/response/api-response';
import TaxCacheService from '~/services/tax-cache.service';

export const useTaxStore = defineStore('taxStore', () => {
  const endpoint = 'taxes';
  const taxList = ref<Tax[] | null>(null);
  const isOperationSuccessful = ref<boolean>(false);

  const { fetchData } = useFetchData<APIResponse<Tax>>();
  const { updateData } = useUpdateData();
  const { createData } = useCreateData<APIResponse<Tax>>();
  const { deleteData } = useDeleteData();
  const offlineStore = useOfflineStore();
  const taxCacheService = new TaxCacheService();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();

  const fetchTaxes = async (fetchAll: boolean = false) => {
    if (offlineStore.isOnline) {
      const response = await fetchData(
        endpoint,
        pagination.value.page,
        pagination.value.perPage,
        pagination.value.searchString,
        fetchAll
      );

      taxList.value = response.data || [];
      setPaginationDetails(
        pagination.value.searchString,
        response.pagination?.page,
        response.pagination?.perPage,
        response.pagination?.totalCount
      );
      if (offlineStore.isMobile) {
        await taxCacheService.addTaxData(taxList.value);
      }
    } else {
      taxList.value = (await taxCacheService.getAllRecords()) as Tax[];
    }
  };

  const createNewTax = async (taxDetails: Tax) => {
    const response = await createData(endpoint, taxDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchTaxes();
  };

  const updateTax = async (taxDetails: Tax) => {
    const response = await updateData(endpoint, taxDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchTaxes();
  };

  const deleteTax = async (taxId: number) => {
    await deleteData(endpoint, taxId);
    await fetchTaxes();
  };

  return {
    isOperationSuccessful,
    taxList,
    deleteTax,
    updateTax,
    createNewTax,
    fetchTaxes,
    pagination,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});
