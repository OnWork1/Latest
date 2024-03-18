import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type SalesTaxGroup } from '~/interfaces/models/sales-tax-group';
import { type APIResponse } from '~/interfaces/response/api-response';
import { useOfflineStore } from '~/stores/useOfflineStore';
import SalesTaxGroupCacheService from '~/services/sales-tax-group-cache.service';

export const useSalesTaxGroupStore = defineStore('salesTaxGroupStore', () => {
  const endpoint = 'sales-tax-groups';
  const salesTaxGroupList = ref<SalesTaxGroup[] | null>(null);
  const isOperationSuccessful = ref<boolean>(false);

  const { fetchData } = useFetchData<APIResponse<SalesTaxGroup>>();
  const { updateData } = useUpdateData();
  const { createData } = useCreateData<APIResponse<SalesTaxGroup>>();
  const { deleteData } = useDeleteData();
  const offlineStore = useOfflineStore();
  const salesTaxGroupCacheService = new SalesTaxGroupCacheService();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();

  const fetchSalesTaxGroups = async (fetchAll: boolean = false) => {
    if (offlineStore.isOnline) {
      const response = await fetchData(
        endpoint,
        pagination.value.page,
        pagination.value.perPage,
        pagination.value.searchString,
        fetchAll
      );

      salesTaxGroupList.value = response.data || [];
      setPaginationDetails(
        pagination.value.searchString,
        response.pagination?.page,
        response.pagination?.perPage,
        response.pagination?.totalCount
      );
      if (offlineStore.isMobile) {
        await salesTaxGroupCacheService.addSalesTaxGroup(
          salesTaxGroupList.value
        );
      }
    }
  };

  const createNewSalesTaxGroup = async (
    salesTaxGroupDetails: SalesTaxGroup
  ) => {
    const response = await createData(endpoint, salesTaxGroupDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchSalesTaxGroups();
  };

  const updateSalesTaxGroup = async (salesTaxGroupDetails: SalesTaxGroup) => {
    const response = await updateData(endpoint, salesTaxGroupDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchSalesTaxGroups();
  };

  const deleteSalesTaxGroup = async (salesTaxGroupId: number) => {
    await deleteData(endpoint, salesTaxGroupId);
    await fetchSalesTaxGroups();
  };

  return {
    isOperationSuccessful,
    salesTaxGroupList,
    createNewSalesTaxGroup,
    updateSalesTaxGroup,
    deleteSalesTaxGroup,
    fetchSalesTaxGroups,
    pagination,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});
